export class Game {

    id: number;
    gameid: string;
    awayTeam: any;
    homeTeam: any;
    date: Date;

    constructor(json: any) {
        // console.log('game constructor');
        // console.log(JSON.stringify(json));
        this.id = json.id;
        this.date = json.date;
        this.awayTeam = json.awayTeam;
        this.homeTeam = json.homeTeam;
        // this is the string used to call the gameplaybyplay service
        const dateNoHyphens: string =  this.date.toString().split('-').join('');
        this.gameid = dateNoHyphens + '-' + this.awayTeam.Abbreviation + '-' +  this.homeTeam.Abbreviation;
        // console.log('gameid ' + this.gameid);
    }

}
