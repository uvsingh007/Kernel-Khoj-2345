const mongoose=require('mongoose')
const userSchema=mongoose.Schema({
    name:{type:String, require:true},
    email:{type:String, require:true, unique:true},
    pass:{type:String, require:true},
    verify:{type:Boolean, default:false},
    avatar:{type:String , default:"https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png"}
},{
    versionKey:false
})

const UserModel=mongoose.model('user',userSchema)

module.exports={
    UserModel
}