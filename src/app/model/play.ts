import { LineOfScrimmage } from '../model/LineOfScrimmage';
import { Player } from '../model/Player';
import { RegularSeasonActivePlayers2017Service } from './regular-season-active-players-2017.service';
// import { Http } from '@angular/http';

export enum PlayType {
    KickingPlay,
    RushingPlay,
    PassingPlay,
    KickAttempt,
    SackingPlay,
    PenatlyPlay,
    LateralPass
}

export class Play {
    json: any;
    index: number;
    description: string;
    quarter: number;
    time: string;
    currentDown: number;
    yardsRemaining: number;
    lineOfScrimmage: LineOfScrimmage;
    playType: PlayType;
    kickingPlay: KickingPlay;
    rushingPlay: RushingPlay;
    passingPlay: PassingPlay;
    kickAttempt: KickAttempt;
    sackingPlay: SackingPlay;
    lateralPass: LateralPass;

    constructor(json: any, i: number) {
        this.json = json;
        this.index = i;
        this.description = json.description;
        this.quarter = json.quarter;
        this.time = json.time;
        this.currentDown = json.currentDown;
        this.yardsRemaining = json.yardsRemaining;
        if (json.lineOfScrimmage) {
            this.lineOfScrimmage = new LineOfScrimmage(json.lineOfScrimmage);
        }
        if (json.kickingPlay) {
            this.playType = PlayType.KickingPlay;
            this.kickingPlay = new KickingPlay(json.kickingPlay);
        } else if (json.rushingPlay) {
            this.playType = PlayType.RushingPlay;
            this.rushingPlay = new RushingPlay(json.rushingPlay);
        } else if (json.passingPlay) {
            this.playType = PlayType.PassingPlay;
            this.passingPlay = new PassingPlay(json.passingPlay);
        } else if (json.kickAttempt) {
            this.playType = PlayType.KickAttempt;
            this.kickAttempt = new KickAttempt(json.kickAttempt);
        } else if (json.sackingPlay) {
            this.playType = PlayType.SackingPlay;
            this.sackingPlay = new SackingPlay(json.sackingPlay);
        } else if (json.penaltyPlay) {
            this.playType = PlayType.PenatlyPlay;
        } else if (json.lateralPass) {
            this.playType = PlayType.LateralPass;
            this.lateralPass = new LateralPass();
        }
    }

    private get minutes(): number {
        const minuteNumber: number = parseInt(this.time.split(':')[0], 10);
        return minuteNumber;
    }

    private get seconds(): number {
        return parseInt(this.time.split(':')[1], 10);
    }

    // The time property in the json was how much time had run off the clock but football fans
    // are used to see how much time is left on the clock which what this property shows
    get clock(): string {
        let clockString = '';
        let clockMinutes: number = 15 - this.minutes - 1;
        const clockSeconds: number = 60 - this.seconds;
        if (this.seconds === 0) {
            clockMinutes++;
        }
        if (clockMinutes < 10) {
            clockString = '0';
        }
        clockString += clockMinutes.toString() + ':';
        if (clockSeconds === 60) {
            clockString += '00';
        } else if (clockSeconds < 10) {
            clockString += '0' + clockSeconds.toString();
        } else {
            clockString += clockSeconds.toString();
        }
        return clockString;
    }

    get downAndDistance(): string {
        let dnd: string;
        switch (+this.currentDown) {
            case 1:
                dnd = '1st and ' + this.yardsRemaining + ' at ' + this.lineOfScrimmage.team + ' ' + this.lineOfScrimmage.yardLine;
                break;
            case 2:
                dnd = '2nd and ' + this.yardsRemaining + ' at ' + this.lineOfScrimmage.team + ' ' + this.lineOfScrimmage.yardLine;
                break;
            case 3:
                dnd = '3rd and ' + this.yardsRemaining + ' at ' + this.lineOfScrimmage.team + ' ' + this.lineOfScrimmage.yardLine;
                break;
            case 4:
                dnd = '4th and ' + this.yardsRemaining + ' at ' + this.lineOfScrimmage.team + ' ' + this.lineOfScrimmage.yardLine;
                break;
            default:
                dnd = '';
                break;
        }
        return dnd;
    }

}

export class KickingPlay {
    teamAbbreviation: string;
    kickingPlayer: Player;
    isBlocked: boolean;
    isNoPlay: boolean;
    subPlays: any[];

    constructor(json) {
        this.teamAbbreviation = json.kickingTeamAbbreviation;
        this.isBlocked = (json.isBlocked === 'true');
        this.isNoPlay = (json.isNoPlay === 'true');
        this.subPlays = new Array<any>();
        if (json.subPlays) {
            this.subPlays = new Array<any>();
            if (json.subPlays.fumble) {
                const fum = new Fumble(json.subPlays.fumble);
                this.subPlays.push(fum);
            }
        }
    }

    get fumbleSubPlay(): Fumble {
        if (this.subPlays.length > 0) {
            return this.subPlays[0];
        }
    }
}

export class RushingPlay {
    teamAbbreviation: string;
    rushingPlayer: Player;
    yardsRushed: number;
    isEndedWithTouchdown: boolean;
    isTwoPointConversion: boolean;
    isNoPlay: boolean;
    subPlays: any[];
    constructor(json) {
        this.teamAbbreviation = json.teamAbbreviation;
        this.yardsRushed = json.yardsRushed;
        this.isEndedWithTouchdown = (json.isEndedWithTouchdown === 'true');
        this.isTwoPointConversion = (json.isTwoPointConversion === 'true');
        this.isNoPlay = (json.isNoPlay === 'true');
        this.rushingPlayer = new Player(json.rushingPlayer);
        this.subPlays = new Array<any>();
        if (json.subPlays) {
            if (json.subPlays.fumble) {
                const fum = new Fumble(json.subPlays.fumble);
                this.subPlays.push(fum);
            }
        }
    }

    get fumbleSubPlay(): Fumble {
        if (this.subPlays.length > 0) {
            return this.subPlays[0];
        }
    }
}

export class PassingPlay {
    teamAbbreviation: string;
    passingPlayer: Player;
    receivingPlayer: Player;
    isCompleted: boolean;
    totalYardsGained: number;
    isEndedWithTouchdown: boolean;
    isTwoPointConversion: boolean;
    isNoPlay: boolean;
    intercepted: boolean;
    subPlays: any[];

    constructor(json) {
        this.teamAbbreviation = json.teamAbbreviation;
        this.isCompleted = (json.isCompleted === 'true');
        this.totalYardsGained = json.totalYardsGained;
        this.isEndedWithTouchdown = (json.isEndedWithTouchdown === 'true');
        this.isTwoPointConversion = (json.isTwoPointConversion === 'true');
        this.isNoPlay = (json.isNoPlay === 'true');
        if (json.passingPlayer != null) {
            this.passingPlayer = new Player(json.passingPlayer);
        }
        if (json.receivingPlayer != null) {
            this.receivingPlayer = new Player(json.receivingPlayer);
        }
        this.intercepted = (json.interceptingPlayer != null);
        this.subPlays = new Array<any>();
        if (json.subPlays) {
            // console.log('json.subPlays.fumble: ' + JSON.stringify(json.subPlays.fumble));
            if (json.subPlays.fumble) {
                const fum = new Fumble(json.subPlays.fumble);
                this.subPlays.push(fum);
            }
        }
    }

    get noReceivingPlayer(): boolean {
        return (this.receivingPlayer === undefined || this.receivingPlayer == null);
    }

    get fumbleSubPlay(): Fumble {
        if (this.subPlays.length > 0) {
            return this.subPlays[0];
        }
    }
}

class KickAttempt {
    teamAbbreviation: string;
    kickingPlayer: Player;
    isFieldGoal: boolean;
    isExtraPoint: boolean;
    isGood: boolean;
    yardsKicked: number;
    isNoPlay: boolean;
    constructor(json) {
        this.teamAbbreviation = json.teamAbbreviation;
        this.isFieldGoal = (json.isFieldGoal === 'true');
        this.isExtraPoint = (json.isExtraPoint === 'true');
        this.isGood = (json.isGood === 'true');
        this.yardsKicked = json.yardsKicked;
        if (json.kickingPlayer != null) {
            this.kickingPlayer = new Player(json.kickingPlayer);
        }
        this.isNoPlay = json.isNoPlay;
    }

    get fieldGoal50Plus(): boolean {
        return this.yardsKicked >= 50;
    }
}

export class SackingPlay {
    teamAbbreviation: string;
    isNoPlay: boolean;
    subPlays: any[];
    constructor(json) {
        // console.log('json.subPlays ' + JSON.stringify(json.subPlays));
        this.teamAbbreviation = json.teamAbbreviation;
        this.isNoPlay = (json.isNoPlay.toString() === 'true');
        this.subPlays = new Array<any>();
        // console.log('json.subPlays ' + JSON.stringify(json.subPlays));
        if (json.subPlays) { // !== undefined && json.subPlays.length > 0
            // console.log('json.subPlays.fumble: ' + JSON.stringify(json.subPlays.fumble));
            if (json.subPlays.fumble) {
                const fum = new Fumble(json.subPlays.fumble);
                this.subPlays.push(fum);
            }
        }
    }

    get fumbleSubPlay(): Fumble {
        // console.log('this.subPlays.length: ' + this.subPlays.length);
        if (this.subPlays.length > 0) {
            return this.subPlays[0];
        }
    }
}

class LateralPass {
    teamAbbreviation: string;
    passingPlayer: Player;
    receivingPlayer: Player;
    constructor() {
    }
    get noReceivingPlayer(): boolean {
        return (this.receivingPlayer === undefined || this.receivingPlayer == null);
    }
}

class Fumble {
    fumblingTeamAbbreviation: string;
    recoveringTeamAbbreviation: string;
    isEndedWithTouchdown: boolean;
    constructor(json) {
        this.fumblingTeamAbbreviation = json.fumblingTeamAbbreviation;
        this.recoveringTeamAbbreviation = json.recoveringTeamAbbreviation;
        this.isEndedWithTouchdown = (json.isEndedWithTouchdown.toString() === 'true');
    }

    get recoveredByOtherTeam(): boolean {
        return (this.recoveringTeamAbbreviation !== undefined && this.fumblingTeamAbbreviation !== this.recoveringTeamAbbreviation);
    }
}
