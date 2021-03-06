var Stock = require("./models/stock");
var fs = require('fs');
var LBL = require("line-by-line");
var async = require('async');
var Sale = require("./models/sale")
var Promise = require("bluebird");



class SimulateData {
    constructor(Name, days, dayPattern, io) {
        this.io = io;
        this.Name = Name;
        this.days = days;
        this.dayPattern = dayPattern;
        this.yearPattern = [0.296040917,0.242915713,0.25705972,0.25604691,0.237010258,0.245181632,0.245625225,
            0.254107885,0.237125365,0.242077013,0.242767283,0.241227278,0.232851318,0.252824245,0.263875394,0.247312797,
            0.214469641,0.242096171,0.255913851,0.261544593,0.24795449,0.261789903,0.250779377,0.219762203,0.229093372,
            0.235658581,0.232455032,0.231581612,0.240541646,0.213598091,0.234215536,0.243550923,0.247111252,0.229176396,
            0.246980989,0.242026741,0.226713797,0.254278029,0.233687643,0.19916856,0.259977278,0.257619316,0.218428501,
            0.269285662,0.242137845,0.247325624,0.249771051,0.245357386,0.255575734,0.235304447,0.230594676,0.258299349,
            0.248027444,0.282023558,0.262771021,0.262898617,0.25245304,0.257160598,0.26788163,0.243902384,0.249722013,
            0.285635915,0.245892291,0.28474171,0.26102107,0.275592681,0.311421327,0.290981125,0.272258987,0.25797581,
            0.24116234,0.298429477,0.282127885,0.304552946,0.294152767,0.275032663,0.278759267,0.295126449,0.304217186,
            0.279810077,0.293467435,0.266790346,0.287407613,0.281967795,0.297860488,0.262748962,0.257387314,0.289572742,
            0.267163367,0.295985845,0.263868886,0.305492279,0.260611433,0.276546957,0.268137868,0.279891662,0.258196893,
            0.272684999,0.250871908,0.267953252,0.292977658,0.273155075,0.257057036,0.268261881,0.273107106,0.275433247,
            0.267646883,0.284866459,0.307974048,0.268696617,0.26481327,0.273653218,0.270002371,0.284817899,0.286015305,
            0.267614081,0.264772333,0.309950006,0.301438382,0.296927612,0.271128691,0.264633331,0.260358642,0.319480492,
            0.239890186,0.273709522,0.294925354,0.273757974,0.266388969,0.257021466,0.294166479,0.30741145,0.295358398,
            0.312244365,0.302984417,0.291006702,0.302243243,0.28052789,0.253369497,0.271871188,0.302022854,0.31276007,
            0.311398836,0.278797559,0.288840075,0.30532229,0.299618935,0.294554961,0.287283951,0.282292917,0.27604092,
            0.256203866,0.291775581,0.307370123,0.284957308,0.26346121,0.296416465,0.284166142,0.280694203,0.287224044,
            0.280698882,0.268295481,0.289027939,0.288528213,0.264015866,0.28723296,0.284626951,0.247765015,0.292459162,
            0.257942018,0.259677729,0.301001322,0.286422954,0.287374544,0.281816779,0.248262572,0.268076298,0.290646326,
            0.294915684,0.26765226,0.277480128,0.299631826,0.293737871,0.270207663,0.251524555,0.257169938,0.264648094,
            0.278228225,0.282521309,0.272382607,0.264754985,0.26964086,0.277586464,0.270655771,0.248406731,0.294081698,
            0.257258288,0.262889211,0.274138594,0.26911748,0.286600931,0.272391771,0.284047854,0.269991161,0.299501572,
            0.258874261,0.270527153,0.256551723,0.283036741,0.275732623,0.280372777,0.252960473,0.2866369,0.285270709,
            0.286286794,0.259239807,0.259786031,0.265115654,0.289799228,0.248952072,0.298887998,0.283778288,0.312081811,
            0.27583618,0.29545732,0.245582397,0.264969829,0.288226412,0.298845957,0.278287176,0.291311786,0.286426637,
            0.272434884,0.268263288,0.257934685,0.275001644,0.279611447,0.307536968,0.280994787,0.292222011,0.283609308,
            0.273641961,0.297258166,0.241586465,0.245540148,0.275306338,0.271884621,0.251690617,0.267854917,0.293776644,
            0.263886821,0.254908083,0.274123778,0.242586067,0.265908718,0.270055897,0.256498693,0.274724415,0.268675241,
            0.24652024,0.227186057,0.282859105,0.260510552,0.278360102,0.262421147,0.28430186,0.282536917,0.279246442,
            0.24023338,0.240853339,0.269254577,0.267548693,0.274288903,0.265344074,0.251670272,0.241888885,0.236501507,
            0.281995291,0.253896986,0.247667828,0.267117468,0.27446785,0.268183023,0.262827964,0.259654458,0.273641553,
            0.269314383,0.265381981,0.260970435,0.242909907,0.243472275,0.272027118,0.277429465,0.241853547,0.255795843,
            0.28315199,0.257488954,0.27249887,0.260039184,0.282864948,0.292770048,0.275779318,0.268051374,0.26919138,
            0.279385764,0.26977364,0.288274806,0.274492207,0.296272676,0.268421393,0.274779176,0.294085231,0.253292796,
            0.268153804,0.260531423,0.276640042,0.29647392,0.268780314,0.292491174,0.260528977,0.326609859,0.273268783,
            0.265462613,0.299097753,0.274458846,0.284885326,0.279626639,0.28122637,0.287433546,0.275704621,0.30464407,
            0.266514645,0.306591988,0.287185877,0.285920623,0.277210044,0.298934621,0.281120564,0.29094133,0.312536842,
            0.281775815,0.306087496,0.314717189,0.318135276,0.313574784,0.317640047,0.317112628,0.306113361,0.313042044,
            0.295027307,0.334286046,0.316653751,0.323650308,0.343199859,0.335852758,0.335400647,0.335934975,0.314641324,
            0.314407947,0.302475861,0.334454528,0.307818215,0.311739605,0.321695998,0.308379044]; // TODO: SORT THIS OUT
        this.StartDate = new Date("January 1, 2016 00:00:00");
        this.CurrentDate = {
            date:this.StartDate,
            num:0,
            hour: 0
        };
        this.dailySalesPercent = [];

        this.linear = {
            A : 1.1,
            B : 10,
            YOffset : 100,
            D : 0.00012,
            E : 29.6,
            PHASE : 35,
            mult : 10,
            round : true,
            noise : true,
            noiseMult: 10
        }



                                console.log("New Data Sim: " + this.Name);
    };

    setOptions(A,B,YOffset,D,E,PHASE,mult,round,noise,noiseMult){
        this.linear = {
            A : Number.parseFloat(A),
            B : Number.parseFloat(B),
            YOffset : Number.parseFloat(YOffset),
            D : Number.parseFloat(D),
            E : Number.parseFloat(E),
            PHASE : Number.parseFloat(PHASE),
            mult :Number.parseFloat( mult),
            round : (round=='true'?true:false),
            noise : (noise=='true'?true:false),
            noiseMult: Number.parseFloat(noiseMult)
        }
    }


    initSalesData(file, cb) {
        var self = this;
        var lr = new LBL(file);
        var x = 0;

        lr.on("error", function (err) {
            console.log(err)
        })

        lr.on("line", function (line) {
            self.dailySalesPercent.push(Number.parseFloat(line));
            // console.log(self.dailySalesPercent);
            let d = new Date(self.StartDate)
            d.setDate(d.getDate() + x);

            x++;
        })

        lr.on("end", function () {
            console.log("Finished reading data");
            cb();
        })
    };

    sendToSockets(ns, obj, cb){
        var self = this;
        // process.nextTick(function () {
        //     self.io.sockets.in("sim-logs").emit(ns, obj)
            cb;
        // })

    }

    run(cb) {
        var self = this;
        var docs = null;
        self.initSalesData("./CSV/PercentSaleByDay.csv", function () {

            Stock.find({sku:2640},function (err, docs) { // Buy just Kingsmill white
                var dayArray = [];
                for(var i = 0; i < self.days; i++){
                    dayArray.push(i)
                }
                console.log("Running!");
                async.eachSeries(dayArray, function (day, done) {
                    let d = new Date(self.StartDate)
                    d.setDate(d.getDate() + day);
                    self.CurrentDate.num = day;
                    self.CurrentDate.date = d;
                    var n = new Date();
                    var m = {
                        message: "Simulating day: " + d.toISOString().slice(0, 10),
                        time: n.getHours() + ":" + n.getMinutes(),
                        error: false
                    };
                    // self.io.sockets.in("sim-logs").emit("newLine", m)
                    console.log(day)
                    self.performDayLinear(docs, function () {
                        done();
                    })
                }, function (err) {
                    cb(self.dailySalesPercent);
                })
            });
        })




    };

    performDayLinear(docs, done){
        var CONSTANT_DAY_BASKETS_AVG = 200; // AVG baskets per day
        // var newSale = new Sale()
        var IT = this.linear;
        var numBread = this.LinearRegression(
            this.CurrentDate.num,
            IT.A,
            IT.B,
            IT.YOffset,
            IT.D,
            IT.E,
            IT.PHASE,
            IT.mult,
            IT.round,
            IT.noise,
            IT.noiseMult);



        var sale = new Sale({
            dateOpen: this.CurrentDate.date,
            dateCompleted:this.CurrentDate.date,
            status: "COMPLETE"
        });

        var I = this.PickStockItem(docs)
        sale.items.push({
            title       :   I.fullTitle,
            sku         :   I.sku,
            barcode     :   I.barcode[0],
            price       :   I.price,
            dep         :   I.dep,
            subDep      :   I.subDep,
            qty         :   numBread
        })
        var n = new Date();
        var m = {
            message:"Simulating Day" + this.CurrentDate.date.toISOString().slice(0, 10) + ". Todays Total Baskets: " +
            numBread + ", TodayNum: " + this.CurrentDate.num,
            dayNum: this.CurrentDate.num,
            time: n.getHours() + ":" + n.getMinutes(),
            dayBaskets: numBread,
            error: false
        }
        // setImmediate(function () {
        this.io.sockets.in("sim-logs").emit("itemPick",m);

        sale.save(function (err, doc) {
            done();
        })

    }

    performDay(docs, done){
        var TimeBefore = new Date().getTime();
        var self = this;
        // var item = this.PickStockItem(docs)
        var n = new Date();

        var todaySIM = self.CurrentDate.date;

        var CONSTANT_DAY_BASKETS_AVG = 200; // AVG baskets per day
        var CONSTANT_DAY_MULTIPLIER = self.yearPattern[this.CurrentDate.num]

        var TodaysBaskets = Math.round(CONSTANT_DAY_BASKETS_AVG * CONSTANT_DAY_MULTIPLIER);

        // SEND TO LOGS
        var m = {
            message:"Simulating Day" + todaySIM.toISOString().slice(0, 10) + ". Todays Total Baskets: " +
                TodaysBaskets + ", TodayNum: " + self.CurrentDate.num,
            dayNum: self.CurrentDate.num,
            time: n.getHours() + ":" + n.getMinutes(),
            dayBaskets: TodaysBaskets,
            error: false
        }
        // setImmediate(function () {
            self.io.sockets.in("sim-logs").emit("itemPick",m);
        // })

        var tot = 0;

        var DayBaskets = []
        var DayBasketsModels = []
        var hoursArray = []
        for(let hour = 0; hour < 24;hour++){
            hoursArray.push(hour);
        }

        async.eachSeries(hoursArray, function (hour, hourFin) {


            var m = {
                simTime:self.CurrentDate.hour,
                simDate:self.CurrentDate.date.toISOString().slice(0, 10),
                maxDay:self.days,
                curDay:self.CurrentDate.num
            }





            var CONSTANT_HOUR_MULTIPLIER = self.dayPattern[hour];
            var BasketsPerHour = Math.round(TodaysBaskets * (CONSTANT_HOUR_MULTIPLIER/100));
            tot+= BasketsPerHour;
            self.CurrentDate.hour = hour;
            var hourSimMessage = {
                message:"Simulating Hour " + self.FormatNumberLength(hour,2)+":00.<br>" +
                    "Total Baskets: " + BasketsPerHour+"/"+TodaysBaskets,
                dayNum: self.CurrentDate.num,
                time: n.getHours() + ":" + n.getMinutes(),
                dayBaskets: TodaysBaskets,
                error: false
            }
            // self.io.sockets.in("sim-logs").emit("hourSim",hourSimMessage);

            self.PerformHour(BasketsPerHour, 1, 6, docs, function (data, models) {
                self.io.sockets.in("sim-logs").emit("simTimeLog", m);
                DayBaskets[hour] = data;
                async.eachSeries(models,function (mod, modFin) {
                    DayBasketsModels.push(mod);
                    modFin();
                }, function (err) {
                    hourFin();
                })
            })


        }, function (err) {// AFTER 24 HOUR SIM


            var BasketMessage = {
                message: "Basket for Day",
                dayBaskets: DayBaskets,
                totalBaskets:   TodaysBaskets,
                date:   self.CurrentDate.date.toISOString().slice(0,10)
            }

            self.io.sockets.in("sim-logs").emit("daySim", BasketMessage)


            console.log("Performed: " + tot + ", Total: " + TodaysBaskets);

            async.eachSeries(DayBasketsModels, function (bask, fin) {
                // console.log("Saving")
                bask.save(function (err) {
                    fin();
                })
            }, function (err){

                var TimeAfter = new Date().getTime();
                var TimePerSim = TimeAfter - TimeBefore;
                var ElapsedTime = TimePerSim / 1000;

                var eta = ((self.days - self.CurrentDate.num) * ElapsedTime) - ElapsedTime;
                console.log("Elapsed Time: " + ElapsedTime+"s. ETA: " + eta +"s")

                done();
            })

        })
        

        
    }

    emitAsync(type, message){
        var self = this;
        return new Promise(function (resolve, reject) {
            var x = self.io.sockets.in("sim-logs").emit(type,message);
            var x = self.io.sockets.in("sim-logs").emit(type,message);

            resolve();
        })
    }

    PerformHour(Baskets, MinPerBasket, MaxPerBasket, docs, cb){
        var self = this;
        var BasketContents = [];
        var BasketsModels = []
        var BasketsArr = []
        for(var basket = 0; basket < Baskets; basket++) {    // ITERATE EACH BASKET
            BasketsArr.push(basket)
        }
        async.eachSeries(BasketsArr, function (basket, BasketsFin) {
            var BasketQuantity = self.getRandomInt(MinPerBasket, MaxPerBasket);
            var randMinute = self.getRandomIntInclusive(0,59);

            var B = {
                date    :self.CurrentDate.date,
                time    :self.FormatNumberLength(self.CurrentDate.hour,2) + ":" + self.FormatNumberLength(randMinute,2),
                minute  : randMinute,
                items   :[]
            }
            var d = B.date.setHours(self.CurrentDate.hour, randMinute);
            var sale = new Sale({
                dateOpen: d,
                dateCompleted:d,
                status: "COMPLETE"
            });
            for(var item = 0; item < BasketQuantity; item++) {
                var I = self.PickStockItem(docs)
                sale.items.push({
                    title       :   I.fullTitle,
                    sku         :   I.sku,
                    barcode     :   I.barcode[0],
                    price       :   I.price,
                    dep         :   I.dep,
                    subDep      :   I.subDep
                })

                B.items.push(I)
            }
            BasketsModels.push(sale);
            BasketContents.push(B);
            var m = {
                simTime:self.CurrentDate.hour,
                simDate:self.CurrentDate.date.toISOString().slice(0, 10),
                maxDay:self.days,
                curDay:self.CurrentDate.num
            }
            // self.emitAsync("simTimeLog", m).then(function () {
                BasketsFin();
            // })

        }, function () {

            var m = {
                simTime:self.CurrentDate.hour,
                simDate:self.CurrentDate.date.toISOString().slice(0, 10),
                maxDay:self.days,
                curDay:self.CurrentDate.num
            }
            // self.emitAsync("simTimeLog", m).then(function () {
                BasketContents.sort(self.compareMinutes)
                cb(BasketContents, BasketsModels);
            // })

        })

    }

    compareMinutes(a,b) {
        if (a.minute < b.minute)
            return -1;
        if (a.minute > b.minute)
            return 1;
        return 0;
    }

    PickStockItem(docs){
        var sum =  0;
        var time = Date.now();
        docs.forEach(function (doc) {
            sum+= doc.SIM_Qty_Perc;
        });
        var r = Math.random() * sum;
        var i = 0;
        while (r > 0){
            r -= docs[i].SIM_Qty_Perc;
            if(r < 0){
                return docs[i];
            }
            i++;
        }
        time = Date.now() - time;
        // console.log(time.toISOString());
        return docs[i];
    }


    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }


    FormatNumberLength(num, length) {
        var r = "" + num;
        while (r.length < length) {
            r = "0" + r;
        }
        return r;
    }

    LinearRegression(t, A, B, C, D, e, p, mult, round, noise, noiseMult){
        var addNoise = 0;
        if(noise){
            addNoise = this.getRandomInt(-(C/10), C/10) * noiseMult;
        }
        if(round){
            return Math.ceil((A * Math.cos((t / e) - p) + B * Math.sin((t / e) - p) + C + D * t) * mult) - addNoise;
        }else {
            return (A * Math.cos((t / e) - p) + B * Math.sin((t / e) - p) + C + D * t) * mult - addNoise;
        }

    }



}


module.exports = SimulateData;