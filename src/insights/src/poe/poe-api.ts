import _ from "lodash";
import fetch from "node-fetch";

import {
  type PoeApiCharacter,
  type PoeApiProfile,
  type PoeApiStashTab,
  type PoeApiPublicStashResponse,
} from "../gql/__generated__/resolvers-types";
import type PoeRateLimitInfo from "./poe-rate-limit-info";
import PoeRateLimitService from "./poe-rate-limit-service";
import { singleton } from "tsyringe";
import { Logger } from "../services/logger";

@singleton()
export default class PoeApi {
  private readonly baseAuthApiUrl: string = "https://www.pathofexile.com";
  private readonly baseApiUrl: string = "https://api.pathofexile.com";
  private readonly scopes: string[] = [
    "account:profile",
    "account:stashes",
    "account:characters",
    "account:league_accounts",
  ];

  private readonly poeApiSecret: string = process.env.POE_CLIENT_SECRET;

  private exchangeTokenRetryDate: Date | null = null;

  constructor(
    private readonly rateLimitService: PoeRateLimitService
  ) {}

  public async fetchCurrentChangeIds(): Promise<string> {
    const res = await fetch(
      "https://www.pathofexile.com/api/trade/data/change-ids",
      {
        headers: {
          "User-Agent": "OAuth poestack/1.0.0 (contact: zgherridge@gmail.com)",
        },
      }
    );
    const json: any = await res.json();
    return json?.psapi;
  }

  public async exchangeForToken(authCode: string): Promise<string> {
    if (
      this.exchangeTokenRetryDate &&
      this.exchangeTokenRetryDate.getTime() > new Date().getTime()
    ) {
      throw new Error("GGG rate limited try again soon.");
    }

    const url = `${this.baseAuthApiUrl}/oauth/token`;

    const params = new URLSearchParams();
    params.append("client_id", "poestack");
    params.append("client_secret", this.poeApiSecret);
    params.append("grant_type", "authorization_code");
    params.append("code", authCode);
    params.append("redirect_uri", "https://poestack.com/ggg/connected");
    params.append("scope", this.scopes.join(" "));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": "OAuth poestack/1.0.0 (contact: zgherridge@gmail.com)",
      },
      body: params,
    });

    const policy = response.headers.get("x-rate-limit-policy");
    const retryAfter = parseInt(response.headers.get("retry-after") ?? "0");

    const rules = response.headers.get("x-rate-limit-rules")?.split(",");
    Logger.info("exchange rate limit", policy, rules, retryAfter);

    if (retryAfter) {
      this.exchangeTokenRetryDate = new Date(Date.now() + retryAfter * 1000);
    }

    const data: any = await response.json();
    return data?.access_token;
  }

  public async fetchPublicStashChanges(
    bearerToken: string,
    paginationCode: string
  ): Promise<{ data: PoeApiPublicStashResponse; rateLimitedForMs: number }> {
    const url = "/public-stash-tabs$query";
    const { data, rateLimitedForMs } = await this.fetch(url, bearerToken, {
      query: paginationCode ? `?id=${paginationCode}` : "",
    });
    return { data, rateLimitedForMs };
  }

  public async fetchCharacters(
    bearerToken: string
  ): Promise<{ data: PoeApiCharacter[]; rateLimitedForMs: number }> {
    const url = "/character";
    const { data, rateLimitedForMs } = await this.fetch(url, bearerToken, {});
    return { data: data?.characters, rateLimitedForMs };
  }

/*   public async fetchLeagues(
    bearerToken: string
  ): Promise<{ data: GqlPoeLeague[]; rateLimitedForMs: number }> {
    const url = "/league";
    const { data, rateLimitedForMs } = await this.fetch(url, bearerToken, {});
    return { data: data?.leagues, rateLimitedForMs };
  } */

  public async fetchCharacter(
    bearerToken: string,
    name: string
  ): Promise<{
    data: PoeApiCharacter;
    rateLimitedForMs: number;
    status: number;
  }> {
    const url = "/character/$name";
    const { data, rateLimitedForMs, status } = await this.fetch(
      url,
      bearerToken,
      {
        name,
      }
    );
    return { data: data?.character, rateLimitedForMs, status };
  }

  public async fetchLeagueAccount(
    bearerToken: string,
    league: string
  ): Promise<{ data: any; rateLimitedForMs: number }> {
    const url = "/league-account/$league";
    const { data, rateLimitedForMs } = await this.fetch(url, bearerToken, {
      league,
    });
    return { data: data?.league_account, rateLimitedForMs };
  }

  public async fetchProfile(
    bearerToken: string
  ): Promise<{ data: PoeApiProfile; rateLimitedForMs: number }> {
    const url = "/profile";
    const { data, rateLimitedForMs } = await this.fetch(url, bearerToken, {});
    return { data, rateLimitedForMs };
  }

  public async fetchStashTabs(
    bearerToken: string,
    league: string
  ): Promise<{ data: PoeApiStashTab[]; rateLimitedForMs: number }> {
    const url = "/stash/$league";
    const { data, rateLimitedForMs } = await this.fetch(url, bearerToken, {
      league,
    });
    return { data: data?.stashes, rateLimitedForMs };
  }

  public async fetchStashTab(
    bearerToken: string,
    stashTabId: string,
    childTabId: string = null,
    league = "Sanctum"
  ): Promise<{ data: PoeApiStashTab; rateLimitedForMs: number }> {
    const url = "/stash/$league/$stashTabId$childStashTabFragment";

    const { data, rateLimitedForMs } = await this.fetch(url, bearerToken, {
      stashTabId,
      league,
      childStashTabFragment: childTabId ? `/${childTabId}` : "",
    });
    return { data: data?.stash, rateLimitedForMs };
  }

  public async *fetchStashTabsWithRetry(
    bearerToken: string,
    stashTabIds: string[],
    league: string
  ): AsyncGenerator<PoeApiStashTab, void, void> {
    const uniqStashTabIds = _.uniq(stashTabIds);
    for (const stashTabId of uniqStashTabIds) {
      while (true) {
        const { data, rateLimitedForMs } = await this.fetchStashTab(
          bearerToken,
          stashTabId,
          null,
          league
        );

        if (rateLimitedForMs) {
          Logger.info("stash fetch retry delaying " + rateLimitedForMs);
          await new Promise((res) => setTimeout(res, rateLimitedForMs));
        } else {
          yield data;
          break;
        }
      }
    }
  }

  public async *fetchChildStashTabsWithRetry(
    bearerToken: string,
    parentId: string,
    childTabIds: string[],
    league: string
  ): AsyncGenerator<PoeApiStashTab, void, void> {
    for (const stashTabId of childTabIds) {
      while (true) {
        const { data, rateLimitedForMs } = await this.fetchStashTab(
          bearerToken,
          parentId,
          stashTabId,
          league
        );

        if (rateLimitedForMs) {
          Logger.info("stash fetch retry delaying " + rateLimitedForMs);
          await new Promise((res) => setTimeout(res, rateLimitedForMs));
        } else {
          yield data;
          break;
        }
      }
    }
  }

  private async fetch(
    variblePath: string,
    token: string,
    variables: any,
    optionsOverride: any = {}
  ): Promise<{ data: any; rateLimitedForMs: number; status: number }> {
    if (!token) {
      throw new Error("ggg no auth token provided.");
    }

    let path = variblePath;
    for (const key of Object.keys(variables)) {
      path = path.replace(`$${key}`, variables[key]);
    }

    const options = _.merge(
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "OAuth poestack/1.0.0 (contact: zgherridge@gmail.com)",
        },
      },
      optionsOverride
    );

    const rateLimitedForMs = this.rateLimitService.getRateLimiMs(
      token,
      variblePath
    );
    if (rateLimitedForMs > 0) {
      return { data: null, rateLimitedForMs, status: null };
    }

    const requestTimestampEpochMs = Date.now();
    const response = await fetch(this.baseApiUrl + path, options);

    const status = response.status;
    if (status === 401) {
      Logger.info(`got GGG 401 : ${path}`);
      return { data: null, rateLimitedForMs: 0, status: 401 };
    }

    const rateLimitInfo: PoeRateLimitInfo = {
      rules: [],
      policy: response.headers.get("x-rate-limit-policy"),
      limits: [],
      retryAfterMs: Math.min(
        parseInt(response.headers.get("retry-after") ?? "0") * 1000,
        1000 * 60 * 3
      ),
      timestampMs: requestTimestampEpochMs,
    };

    const rules = response.headers.get("x-rate-limit-rules")?.split(",");
    Logger.info(
      "x-rate-limit",
      rateLimitInfo.policy,
      rules,
      rateLimitInfo.retryAfterMs
    );
    if (rateLimitInfo.policy && rules?.length > 0) {
      for (const rule of rules) {
        const limitArray = response.headers
          .get(`x-rate-limit-${rule}`)
          .split(",");
        const stateArray = response.headers
          .get(`x-rate-limit-${rule}-state`)
          .split(",");

        for (let i = 0; i < limitArray.length; i++) {
          const limitDataArray = limitArray[i].split(":");
          const limitStateDataArray = stateArray[i].split(":");

          const limit = {
            maximumHitsCount: parseInt(limitDataArray[0]),
            periodTestedMs: parseInt(limitDataArray[1]) * 1000,
            potentialTimePenaltyMs: parseInt(limitDataArray[2]) * 1000,
            currentHitsCount: parseInt(limitStateDataArray[0]),
            currentTimePenaltyMs: parseInt(limitStateDataArray[2]) * 1000,
          };
          rateLimitInfo.limits.push(limit);
        }
      }

      this.rateLimitService.recordResponse(token, variblePath, rateLimitInfo);
    }

    let json;
    if (status < 300) {
      json = await response.json();
    }

    return {
      data: json,
      rateLimitedForMs: rateLimitInfo.retryAfterMs,
      status: status,
    };
  }
}
