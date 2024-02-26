export type CurrencySwitch = "chaos" | "divine" | "both";

export const chaosIcon =
  "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png";
export const divineIcon =
  "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png";

export const round = (value: number, fraction = 2) => Math.round(value * 10 ** fraction) / 10 ** fraction;

export const formatValue = (
  inputValue?: number,
  toCurrency?: CurrencySwitch,
  divinePrice?: number,
  splitIcons = true,
  showChange = false,
  valueShort = true
) => {
  let value = inputValue ?? 0;
  let absValue: number = Math.abs(value);
  let formattedValue = "0";
  let formattedPrimaryValue: number | undefined; // Chaos value if divine
  let currencyShort: "c" | "div" = "c";
  let icon = chaosIcon;
  let parsedValue = value >= 10 ? round(value, 1) : round(value, 2);
  if (toCurrency === "divine" || (toCurrency === "both" && divinePrice && absValue >= divinePrice)) {
    if (divinePrice && divinePrice !== 0 && absValue !== 0) {
      absValue /= divinePrice;
      value /= divinePrice;
    }
    currencyShort = "div";
    icon = divineIcon;

    parsedValue = value >= 10 ? round(value, 1) : round(value, 2);

    if (splitIcons && divinePrice && divinePrice !== 0 && absValue !== 0) {
      formattedPrimaryValue = Math.trunc(value);
      absValue = (absValue - Math.trunc(absValue)) * divinePrice;
      value = (value - Math.trunc(value)) * divinePrice;
      icon = chaosIcon;
    }
  }

  const prefix = value < 0 ? "− " : showChange && value > 0 ? "+ " : "";
  if (valueShort && absValue >= 1_000_000) {
    formattedValue = `${prefix}${(absValue / 1_000_000).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}kk`;
  } else if (valueShort && absValue >= 1_000) {
    formattedValue = `${prefix}${(absValue / 1_000).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}k`;
  } else {
    formattedValue = `${prefix}${absValue.toLocaleString(undefined, {
      maximumFractionDigits: absValue >= 10 ? 1 : 2,
    })}`;
  }

  return { formattedValue, formattedPrimaryValue, value: parsedValue, currency: currencyShort, icon };
};

export type FormattedValue = ReturnType<typeof formatValue>;
