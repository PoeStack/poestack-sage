import { computed } from 'mobx'
import { getRefsResolvingTo, getRoot, model, Model, modelAction, tProp, types } from 'mobx-keystone'
import { League } from './domains/league'
import { PoeLeague } from 'sage-common'
import objectHash from 'object-hash'
import { profileLeagueRef, profilePriceLeagueRef } from './domains/profile'
import { ILeagueNode } from '../interfaces/league.interface'

export const createLeagueHash = (name: string, realm: string) =>
  objectHash({ prefix: 'league', name, realm })

@model('nw/leagueStore')
export class LeagueStore extends Model({
  leagues: tProp(types.array(types.model(League)), []),
  priceLeagues: tProp(types.array(types.model(League)), [])
}) {
  @modelAction
  updateLeagues(activeApiLeagues: PoeLeague[]) {
    const activeLeagues = activeApiLeagues.map(
      (league): ILeagueNode => ({
        hash: createLeagueHash(league.id, league.realm!),
        name: league.id,
        realm: league.realm!,
        deleted: false
      })
    )

    let i = this.leagues.length
    while (i--) {
      const pl = this.leagues[i]
      const foundLeague = activeLeagues.find((x) => pl.hash === x.hash)
      if (foundLeague) {
        // Update already existent leagues
        pl.updateLeague(foundLeague)
      } else {
        if (getRefsResolvingTo(pl, profileLeagueRef).size === 0) {
          // No profile reference - safe to delete
          console.log('Delete league: ', this.leagues[i])
          this.leagues.splice(i, 1)
        } else {
          // Mark league as deleted
          console.log('Mark league as deleted: ', this.leagues[i])
          pl.setDeleted(true)
        }
      }
    }

    // Add new leagues
    const newLeagues = activeLeagues.filter((x) => !this.leagues.some((y) => y.hash === x.hash))
    if (newLeagues.length > 0) {
      this.leagues.push(...newLeagues.map((x) => new League(x)))
    }
  }

  @modelAction
  updatePriceLeagues(activeApiLeagues: PoeLeague[]) {
    const activeLeagues = activeApiLeagues.map(
      (league): ILeagueNode => ({
        hash: objectHash({ prefix: 'priceLeague', name: league.id, realm: league.realm! }),
        name: league.id,
        realm: league.realm!,
        deleted: false
      })
    )

    let i = this.priceLeagues.length
    while (i--) {
      const pl = this.priceLeagues[i]
      const foundLeague = activeLeagues.find((x) => pl.hash === x.hash)
      if (foundLeague) {
        // Update already existent leagues
        pl.updateLeague(foundLeague)
      } else {
        if (getRefsResolvingTo(pl, profilePriceLeagueRef).size === 0) {
          // No profile reference - safe to delete
          console.log('Delete price league: ', this.leagues[i])
          this.priceLeagues.splice(i, 1)
        } else {
          // Mark league as deleted
          console.log('Mark price league as deleted: ', this.leagues[i])
          pl.setDeleted(true)
        }
      }
    }

    // Add new leagues
    const newLeagues = activeLeagues.filter(
      (x) => !this.priceLeagues.some((y) => y.hash === x.hash)
    )
    if (newLeagues.length > 0) {
      this.priceLeagues.push(...newLeagues.map((x) => new League(x)))
    }
  }
}
