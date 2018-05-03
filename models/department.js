var mongoose = require("mongoose");

var depSchema = mongoose.Schema({
    departmentName      :   String,
    departmentNum       :   Number,
    subDeps             :   [{
        subDepName      :   String,
        subDepNum       :   Number
    }]
},{
    usePushEach : true
});


depSchema.statics.addSubDep = function(depNum, subDepName, subDepNum, cb){
    this.findOne({departmentNum:   depNum},
        function (err, doc) {
            if(!err) {
                var isUsed = false;
                doc.subDeps.forEach(function (sd) {
                    if(sd.subDepNum == subDepNum){
                        isUsed = true;
                    }
                });
                if(!isUsed) {
                    doc.subDeps.push({subDepName: subDepName, subDepNum: subDepNum})
                    doc.save(function (err) {
                        if (!err) {
                            cb({err: false})
                        } else {
                            cb({err: true, errMsg: err})
                        }
                    })
                }else {
                    cb({err:true,errMsg:"Duplicate Sub Department Key Used"})
                }
            }else {
                cb({err:true,errMsg:err})
            }
        });
};



module.exports = mongoose.model("Department", depSchema);