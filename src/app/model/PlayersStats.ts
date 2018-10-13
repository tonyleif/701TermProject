import { Player } from './Player';
import { PlayerStats } from './PlayerStats';
import { PlayType, PassingPlay, RushingPlay, SackingPlay, KickingPlay } from './Play';
import { DefenseSepecialTeamsStats } from './DefenseSpecialTeamsStats';

export class PlayersStats {
    playersStats: Set<PlayerStats>;
    awayDSTStats: DefenseSepecialTeamsStats;
    homeDSTStats: DefenseSepecialTeamsStats;
    awayTeamAbbreviation: string;
    homeTeamAbbreviation: string;

    static findPlayerStats(player: Player, teamAbbr: string, playerStatsSet: Set<PlayerStats>): PlayerStats {
        if (player == null) {
            return null;
        }
        // Find player in set
        let newPlayerStats: PlayerStats;
        if (playerStatsSet.size > 0) {
            playerStatsSet.forEach(function (ps: PlayerStats) {
                if (ps.player.id === player.id) {
                    newPlayerStats = ps;
                    return ps;
                }
            });
        }
        if (newPlayerStats != null) {
            return newPlayerStats;
        }
        // Add player to set if not found
        newPlayerStats = new PlayerStats(player, teamAbbr);
        playerStatsSet.add(newPlayerStats);
        return newPlayerStats;
    }

    constructor(playsWatched, awayTeamAbbr: string, homeTeamAbbr: string) {
        const tempPlayersStats = new Set<PlayerStats>();
        this.awayDSTStats = new DefenseSepecialTeamsStats(awayTeamAbbr);
        const awayDSTStatsLocal = this.awayDSTStats;
        this.homeDSTStats = new DefenseSepecialTeamsStats(homeTeamAbbr);
        const homeDSTStatsLocal = this.homeDSTStats;
        this.awayTeamAbbreviation = awayTeamAbbr;
        this.homeTeamAbbreviation = homeTeamAbbr;
        let currentPlayerStats: PlayerStats;
        playsWatched.forEach(function (p, idx, array) {
            if (!p.isCancelsPlay) {
                switch (p.playType) {
                    case PlayType.PassingPlay:
                        const passingPlay = new PassingPlay(p.json.passingPlay);
                        if (!p.passingPlay.isNoPlay) {
                            if (p.passingPlay.isCompleted) {
                                // Passing player
                                currentPlayerStats = PlayersStats.findPlayerStats(
                                    p.passingPlay.passingPlayer, p.passingPlay.teamAbbreviation, tempPlayersStats);
                                currentPlayerStats.passingYards += +p.passingPlay.totalYardsGained;
                                if (p.passingPlay.isEndedWithTouchdown) {
                                    if (passingPlay.isTwoPointConversion) {
                                        currentPlayerStats.twoPointConversions++;
                                    } else {
                                        currentPlayerStats.passingTouchdowns++;
                                    }
                                }
                                if (idx === 0) {
                                    currentPlayerStats.accruedStatsOnLastPlay = true;
                                }
                                // Receiving player
                                if (p.passingPlay.receivingPlayer != null) {
                                    currentPlayerStats = PlayersStats.findPlayerStats(
                                        p.passingPlay.receivingPlayer, p.passingPlay.teamAbbreviation, tempPlayersStats);
                                    currentPlayerStats.receivingYards += +p.passingPlay.totalYardsGained;
                                    if (p.passingPlay.isEndedWithTouchdown) {
                                        if (passingPlay.isTwoPointConversion) {
                                            currentPlayerStats.twoPointConversions++;
                                        } else {
                                            currentPlayerStats.touchdowns++;
                                        }
                                    }
                                    if (idx === 0) {
                                        currentPlayerStats.accruedStatsOnLastPlay = true;
                                    }
                                }
                                // DST
                                if (passingPlay.fumbleSubPlay !== undefined) {
                                    if (passingPlay.fumbleSubPlay.recoveredByOtherTeam) {
                                        let defenseTeamStats: DefenseSepecialTeamsStats;
                                        if (passingPlay.teamAbbreviation === awayTeamAbbr) {
                                            defenseTeamStats = homeDSTStatsLocal;
                                        } else {
                                            defenseTeamStats = awayDSTStatsLocal;
                                        }
                                        defenseTeamStats.fumblesRecovered += 1;
                                        if (passingPlay.fumbleSubPlay.isEndedWithTouchdown) {
                                            defenseTeamStats.touchDowns += 1;
                                        }
                                        if (idx === 0) {
                                            defenseTeamStats.accruedStatsOnLastPlay = true;
                                        }
                                    }
                                }
                            } else {
                                // DST
                                if (p.passingPlay.intercepted) {
                                    // Passing player
                                    currentPlayerStats = PlayersStats.findPlayerStats(
                                        p.passingPlay.passingPlayer, p.passingPlay.teamAbbreviation, tempPlayersStats);
                                    currentPlayerStats.interceptions += 1;
                                    if (p.passingPlay.teamAbbreviation === awayTeamAbbr) {
                                        homeDSTStatsLocal.interceptions += 1;
                                        if (p.passingPlay.isEndedWithTouchdown === true) {
                                            homeDSTStatsLocal.touchDowns += 1;
                                        }
                                        if (idx === 0) {
                                            homeDSTStatsLocal.accruedStatsOnLastPlay = true;
                                        }
                                    } else {
                                        awayDSTStatsLocal.interceptions += 1;
                                        if (p.passingPlay.isEndedWithTouchdown === true) {
                                            awayDSTStatsLocal.touchDowns += 1;
                                        }
                                        if (idx === 0) {
                                            awayDSTStatsLocal.accruedStatsOnLastPlay = true;
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    case PlayType.RushingPlay:
                        const rushingPlay: RushingPlay = new RushingPlay(p.json.rushingPlay);
                        if (!(rushingPlay.isNoPlay)) {
                            currentPlayerStats = PlayersStats.findPlayerStats(
                                rushingPlay.rushingPlayer, rushingPlay.teamAbbreviation, tempPlayersStats);
                            currentPlayerStats.rushingYards += +rushingPlay.yardsRushed;
                            if (rushingPlay.isEndedWithTouchdown) {
                                if (rushingPlay.isTwoPointConversion) {
                                    currentPlayerStats.twoPointConversions++;
                                } else {
                                    currentPlayerStats.touchdowns++;
                                }
                            }
                            if (rushingPlay.fumbleSubPlay != null) {
                                if (rushingPlay.fumbleSubPlay.recoveredByOtherTeam) {
                                    let defenseTeamStats: DefenseSepecialTeamsStats;
                                    if (rushingPlay.teamAbbreviation === awayTeamAbbr) {
                                        defenseTeamStats = homeDSTStatsLocal;
                                    } else {
                                        defenseTeamStats = awayDSTStatsLocal;
                                    }
                                    defenseTeamStats.fumblesRecovered += 1;
                                    if (rushingPlay.fumbleSubPlay.isEndedWithTouchdown) {
                                        defenseTeamStats.touchDowns += 1;
                                    }
                                    if (idx === 0) {
                                        defenseTeamStats.accruedStatsOnLastPlay = true;
                                    }
                                }
                            }
                            if (idx === 0) {
                                currentPlayerStats.accruedStatsOnLastPlay = true;
                            }
                        }
                        break;
                    case PlayType.KickAttempt:
                        if (!(p.kickAttempt.isNoPlay === 'true')) {
                            currentPlayerStats = PlayersStats.findPlayerStats(
                                p.kickAttempt.kickingPlayer, p.kickAttempt.teamAbbreviation, tempPlayersStats);
                            if (p.kickAttempt.isGood) {
                                if (p.kickAttempt.isExtraPoint) {
                                    currentPlayerStats.extraPoints += 1;
                                } else {
                                    if (p.kickAttempt.isFieldGoal) {
                                        currentPlayerStats.fieldGoals += 1;
                                        if (p.kickAttempt.fieldGoal50Plus) {
                                            currentPlayerStats.fieldGoals50Plus += 1;
                                        }
                                    }
                                }
                            }
                            if (idx === 0) {
                                currentPlayerStats.accruedStatsOnLastPlay = true;
                            }
                        }
                        break;
                    case PlayType.KickingPlay:
                        const kickingPlay: KickingPlay = new KickingPlay(p.json.kickingPlay);
                        if (!(kickingPlay.isNoPlay)) {
                            // DST
                            let defenseTeamStats: DefenseSepecialTeamsStats;
                            if (kickingPlay.teamAbbreviation === awayTeamAbbr) {
                                defenseTeamStats = homeDSTStatsLocal;
                            } else {
                                defenseTeamStats = awayDSTStatsLocal;
                            }
                            if (kickingPlay.isBlocked) {
                                defenseTeamStats.blockedKicks += 1;
                                if (kickingPlay.fumbleSubPlay != null) {
                                    if (kickingPlay.fumbleSubPlay.isEndedWithTouchdown) {
                                        defenseTeamStats.touchDowns += 1;
                                    }
                                }
                                if (idx === 0) {
                                    defenseTeamStats.accruedStatsOnLastPlay = true;
                                }
                            } else {
                                if (kickingPlay.fumbleSubPlay != null) {
                                    if (kickingPlay.fumbleSubPlay.recoveredByOtherTeam) {
                                        defenseTeamStats.fumblesRecovered += 1;
                                        if (kickingPlay.fumbleSubPlay.isEndedWithTouchdown) {
                                            defenseTeamStats.touchDowns += 1;
                                        }
                                        if (idx === 0) {
                                            defenseTeamStats.accruedStatsOnLastPlay = true;
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    case PlayType.SackingPlay:
                        const sackingPlay: SackingPlay = new SackingPlay(p.json.sackingPlay);
                        if (!(sackingPlay.isNoPlay)) {
                            let sackingTeamStats: DefenseSepecialTeamsStats;
                            if (sackingPlay.teamAbbreviation === awayTeamAbbr) {
                                sackingTeamStats = homeDSTStatsLocal;
                            } else {
                                sackingTeamStats = awayDSTStatsLocal;
                            }
                            sackingTeamStats.sacks += 1;
                            if (sackingPlay.fumbleSubPlay != null) {
                                if (sackingPlay.fumbleSubPlay.recoveredByOtherTeam) {
                                    sackingTeamStats.fumblesRecovered += 1;
                                    if (sackingPlay.fumbleSubPlay.isEndedWithTouchdown) {
                                        sackingTeamStats.touchDowns += 1;
                                    }
                                }
                            }
                            if (idx === 0) {
                                sackingTeamStats.accruedStatsOnLastPlay = true;
                            }
                        }
                        break;
                }
            }
        });
        this.playersStats = tempPlayersStats;
    }

    get sortedPlayersStats(): PlayerStats[] {
        const nonSortedArray: PlayerStats[] = Array.from(this.playersStats);
        const sortedArray = nonSortedArray.sort((ps1, ps2) => {
            if (ps1.passingYards < ps2.passingYards) {
                return 1;
            }
            if (ps1.passingYards > ps2.passingYards) {
                return -1;
            }
            if (ps1.rushingYards < ps2.rushingYards) {
                return 1;
            }
            if (ps1.rushingYards > ps2.rushingYards) {
                return -1;
            }
            if (ps1.receivingYards < ps2.receivingYards) {
                return 1;
            }
            if (ps1.receivingYards > ps2.receivingYards) {
                return -1;
            }
            return 0;
        });
        return sortedArray;
    }
    get awayTeamPlayersStats(): PlayerStats[] {
        return this.getTeamPlayersStats(this.awayTeamAbbreviation);
    }

    get homeTeamPlayersStats(): PlayerStats[] {
        return this.getTeamPlayersStats(this.homeTeamAbbreviation);
    }

    get awayTeamQBsStats(): PlayerStats[] {
        return this.awayTeamPlayersStats.filter((ps) => ps.player.position === 'QB');
    }

    get homeTeamQBsStats(): PlayerStats[] {
        return this.homeTeamPlayersStats.filter((ps) => ps.player.position === 'QB');
    }

    get awayTeamRBsStats(): PlayerStats[] {
        return this.awayTeamPlayersStats.filter((ps) => ps.player.position === 'RB' || ps.player.position === 'FB');
    }

    get homeTeamRBsStats(): PlayerStats[] {
        return this.homeTeamPlayersStats.filter((ps) => ps.player.position === 'RB' || ps.player.position === 'FB');
    }

    get awayTeamWRsStats(): PlayerStats[] {
        return this.awayTeamPlayersStats.filter((ps) => ps.player.position === 'WR');
    }

    get homeTeamWRsStats(): PlayerStats[] {
        return this.homeTeamPlayersStats.filter((ps) => ps.player.position === 'WR');
    }

    get awayTeamTEsStats(): PlayerStats[] {
        return this.awayTeamPlayersStats.filter((ps) => ps.player.position === 'TE');
    }

    get homeTeamTEsStats(): PlayerStats[] {
        return this.homeTeamPlayersStats.filter((ps) => ps.player.position === 'TE');
    }

    get awayTeamKsStats(): PlayerStats[] {
        return this.awayTeamPlayersStats.filter((ps) => ps.player.position === 'K');
    }

    get homeTeamKsStats(): PlayerStats[] {
        return this.homeTeamPlayersStats.filter((ps) => ps.player.position === 'K');
    }

    getTeamPlayersStats(teamAbbr: string) {
        const filteredArray: PlayerStats[] = new Array<PlayerStats>();
        // const homeTeamAbbr = this.homeTeamAbbreviation;
        this.playersStats.forEach((ps) => {
            if (ps.teamAbbreviation === teamAbbr) {
                filteredArray.push(ps);
            }
        });
        const sortedArray = filteredArray.sort((ps1, ps2) => {
            if (ps1.passingYards < ps2.passingYards) {
                return 1;
            }
            if (ps1.passingYards > ps2.passingYards) {
                return -1;
            }
            if (ps1.rushingYards < ps2.rushingYards) {
                return 1;
            }
            if (ps1.rushingYards > ps2.rushingYards) {
                return -1;
            }
            if (ps1.receivingYards < ps2.receivingYards) {
                return 1;
            }
            if (ps1.receivingYards > ps2.receivingYards) {
                return -1;
            }
            return 0;
        });
        return sortedArray;
        // return filteredArray;
    }

}



