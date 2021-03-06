import { LineOfScrimmage } from '../model/LineOfScrimmage';
import { Player } from '../model/Player';
import { RegularSeasonActivePlayers2017Service } from './regular-season-active-players-2017.service';
import { UnhandledAlertError } from 'selenium-webdriver';
import { jsonpFactory } from '@angular/http/src/http_module';
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
    lineOfScrimmage: FieldPosition; // LineOfScrimmage todo: remove LineOfScrimmage class
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
            this.lineOfScrimmage = new FieldPosition(json.lineOfScrimmage);
        }
        if (json.kickingPlay) {
            this.playType = PlayType.KickingPlay;
            this.kickingPlay = new KickingPlay(json.kickingPlay);
        } else if (json.rushingPlay) {
            this.playType = PlayType.RushingPlay;
            this.rushingPlay = new RushingPlay(json.rushingPlay, this.lineOfScrimmage);
        } else if (json.passingPlay) {
            this.playType = PlayType.PassingPlay;
            this.passingPlay = new PassingPlay(json.passingPlay, this.lineOfScrimmage);
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
    retrievingTeamAbbreviation: string;
    kickingPlayer: Player;
    retrievingPlayer: Player;
    isBlocked: boolean;
    isNoPlay: boolean;
    isTouchdown: boolean;
    subPlays: any[];

    constructor(json) {
        this.teamAbbreviation = json.kickingTeamAbbreviation;
        this.retrievingTeamAbbreviation = json.retrievingTeamAbbreviation;
        this.isBlocked = (json.isBlocked === 'true');
        this.isNoPlay = (json.isNoPlay === 'true');
        this.isTouchdown = (json.isTouchdown === 'true');
        this.subPlays = new Array<any>();
        if (json.kickingPlayer != null) {
            this.kickingPlayer = new Player(json.kickingPlayer);
        }
        if (json.retrievingPlayer != null) {
            this.retrievingPlayer = new Player(json.retrievingPlayer);
        }
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
    stoppedAtPosition: LineOfScrimmage;

    constructor(json, lineOfScrimmage: FieldPosition) {
        this.teamAbbreviation = json.teamAbbreviation;
        this.yardsRushed = json.yardsRushed;
        this.isEndedWithTouchdown = (json.isEndedWithTouchdown === 'true');
        this.isTwoPointConversion = (json.isTwoPointConversion === 'true');
        this.isNoPlay = (json.isNoPlay === 'true');
        if (json.stoppedAtPosition) {
            this.stoppedAtPosition = new LineOfScrimmage(json.stoppedAtPosition);
        }
        if (!json.rushingPlayer) {
            console.log('No rushing player');
        }
        this.rushingPlayer = new Player(json.rushingPlayer);
        this.subPlays = new Array<any>();
        if (json.subPlays) {
            // console.log('json.subPlays: ' + JSON.stringify(json.subPlays));
            if (json.subPlays.fumble) {
                const fum = new Fumble(json.subPlays.fumble);
                this.subPlays.push(fum);
            }
            if (json.subPlays.passingPlay) {
                const pass = new PassingPlay(json.subPlays.passingPlay, lineOfScrimmage);
                this.subPlays.push(pass);
            }
        }
    }

    get fumbleSubPlay(): Fumble {
        for (let i = 0; i < this.subPlays.length; i++) {
            if (this.subPlays[i] instanceof Fumble) {
                return this.subPlays[i];
            }
        }
        return null;
    }

    get passingSubPlay(): PassingPlay {
        for (let i = 0; i < this.subPlays.length; i++) {
            if (this.subPlays[i] instanceof PassingPlay) {
                // console.log(JSON.stringify(this.subPlays[i]));
                return this.subPlays[i];
            }
        }
        return null;
    }

    get hasPassingSubPlay(): boolean {
        return this.passingSubPlay != null;
    }
}

export class PassingPlay {
    json: any;
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
    penalties: Penalty[];
    receivedAtPosition: FieldPosition;
    lineOfScrimmage: FieldPosition;
    stoppedAtPosition: LineOfScrimmage;

    constructor(json, lineOfScrim: FieldPosition) {
        this.json = json;
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
            if (json.subPlays.fumble) {
                const fum = new Fumble(json.subPlays.fumble);
                this.subPlays.push(fum);
            }
        }
        this.penalties = new Array<Penalty>();
        if (json.penalties && (json.penalties.penalty && json.penalties.penalty.length > 0)) {
            const penaltiesRef: Penalty[] = this.penalties;
            json.penalties.penalty.forEach(penalty => {
                const pen = new Penalty(penalty);
                penaltiesRef.push(pen);
            });
        }
        if (json.receivedAtPosition) {
            this.receivedAtPosition = new FieldPosition(json.receivedAtPosition);
        }
        this.lineOfScrimmage = lineOfScrim;
        if (json.stoppedAtPosition) {
            this.stoppedAtPosition = new LineOfScrimmage(json.stoppedAtPosition);
        }
    }

    get noReceivingPlayer(): boolean {
        if (this.receivingPlayer === undefined || this.receivingPlayer == null) {
            console.log('noReceivingPlayer ' + JSON.stringify(this.json.receivingPlayer));
        }
        return (this.receivingPlayer === undefined || this.receivingPlayer == null);
    }

    get fumbleSubPlay(): Fumble {
        if (this.subPlays.length > 0) {
            let i = 0;
            for (i = 0; i < this.subPlays.length; i++) {
                if (this.subPlays[i] instanceof Fumble) {
                    return this.subPlays[i];
                }
            }
            return null;
        }
    }

    get blockingSpotFoul(): Penalty {
        let pen: Penalty = null;
        this.penalties.forEach(penalty => {
            if ((penalty.description === 'Offensive Holding' || penalty.description === 'Illegal Block Above the Waist')
            && !penalty.isCancelsPlay && penalty.yardsPenalized > 0 && penalty.enforcedAtPosition !== null) {
                // console.log('holding penalty spot foul, penalty.enforcedAtPosition: ' + JSON.stringify(penalty.enforcedAtPosition));
                pen = penalty;
                return penalty;
            }
        });
        return pen;
    }

    get statYards(): number {
        if (this.blockingSpotFoul != null) {
            // console.log(this.holdingSpotFoul.description);
            if (this.blockingSpotFoul.enforcedAtPosition.team === this.lineOfScrimmage.team) {
                return +this.blockingSpotFoul.enforcedAtPosition.yardLine - +this.lineOfScrimmage.yardLine;
            } else {
                return 100 - +this.blockingSpotFoul.enforcedAtPosition.yardLine - +this.lineOfScrimmage.yardLine;
            }
        } else {
            return this.totalYardsGained;
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
    fumblingPlayer: Player;
    constructor(json) {
        this.fumblingTeamAbbreviation = json.fumblingTeamAbbreviation;
        this.recoveringTeamAbbreviation = json.recoveringTeamAbbreviation;
        if (json.isEndedWithTouchdown) {
            this.isEndedWithTouchdown = (json.isEndedWithTouchdown.toString() === 'true');
        } else {
            this.isEndedWithTouchdown = false;
        }
        this.fumblingPlayer = new Player(json.fumblingPlayer);
    }

    get recoveredByOtherTeam(): boolean {
        return (this.recoveringTeamAbbreviation !== undefined && this.fumblingTeamAbbreviation !== this.recoveringTeamAbbreviation);
    }
}

class Penalty {
    enforcedAtPosition: FieldPosition;
    description: string;
    isCancelsPlay: boolean;
    yardsPenalized: number;

    constructor(json) {
        if (json.enforcedAtPosition) {
            this.enforcedAtPosition = new FieldPosition(json.enforcedAtPosition);
        }
        this.description = json.description;
        this.isCancelsPlay = (json.isCancelsPlay === 'true');
        this.yardsPenalized = json.yardsPenalized;
    }

}

class FieldPosition {
    team: string;
    yardLine: number;

    constructor(json) {
        // console.log(json);
        this.team = json.team;
        this.yardLine = json.yardLine;
    }
}
