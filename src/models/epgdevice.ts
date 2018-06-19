export class EPGDevice {

    /*
    Model:
      'paired': {"name":"My Mambo","id":"EF:C8:D6:BF:69:FA"}
      'injections': [{id: number, date: timestamp, units: number}]
      'replacements': [timestamp,]
      'status': [{battery: number, dose: number, warnings: [code], errors: [code], suggested_replacement: timestamp}]
    */

    // TODO iniciar estos datos
    private _id: any;
    private _name: any;
    private _batteryLevel: number = 75;
    private _dose: number;
    private _errors: number;
    private _warnings: number;
    private _dates: Date[] = [];
    private _doses: number[] = [];

    constructor(peripheralData) {
        this._id = peripheralData.id;
        this._name = peripheralData.name;
    }

    public getId() {
        return this._id;
    }

    public getName() {
        return this._name;
    }
 
    public getDates(): Date[] {
        return this._dates;
    }

    public getDoses(): number[] {
        return this._doses;
    }

    public clearInjections() {
        this._dates = [];
        this._doses = [];
    }

    public addInjection(date, dose) {
        if (dose != this._dose) {
            this._dates.push(date);//.toISOString());
            this._doses.push(dose);
            this._dose = dose;
        }
    }

    public getBatteryLevel() {
        return this._batteryLevel;
    }

    public setBatteryLevel(level) {
        this._batteryLevel = level;
    }

    public getDose() {
        return this._dose;
    }

    public pendingWarn(): boolean {
        return this._warnings != 0;
    }

    public getWarnings() {
        return this._warnings;
    }

    public setWarnings(w) {
        this._warnings = w;
    }

    public pendingErr(): boolean {
        return this._errors != 0;
    }

    public getErrors() {
        return this._errors;
    }

    public setErrors(e) {
        this._errors = e;
    }
}
