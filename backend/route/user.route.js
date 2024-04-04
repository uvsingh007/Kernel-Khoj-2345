const express=require('express')
const userRouter=express.Router()
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const{UserModel}=require('../model/user.model')
const {auth}=require('../middleware/auth.middleware')
const multer=require('multer')
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/')
    },
    filename:function(req,file,cb){
        const uniqueFilename = `${Date.now()}-${file.originalname}`;
        cb(null,uniqueFilename)
    }
})
const upload=multer({storage:storage})

userRouter.get('/',auth,async(req,res)=>{
    try{
        const user=await UserModel.find()
        res.status(200).json(user)
    }
    catch(err)
    {
        res.status(400).json({error:err})
    }
})

userRouter.post('/signup',async(req,res)=>{
    const {name,email,pass}=req.body
    try{
        const hash=await bcrypt.hash(pass,5)
        const user=new UserModel({name,email,pass:hash})
        await user.save()
        res.status(200).json({msg:'user has been registered'})
    }
    catch(err)
    {
        console.log(err)
        res.status(400).json({error:err})
    } 
})

userRouter.post('/login',async(req,res)=>{
    const {email,pass}=req.body
    try{
        const user=await UserModel.findOne({email})
        if(user) 
        {
            bcrypt.compare(pass,user.pass,async(err,result)=>{
                if(err)
                {
                    res.status(200).json({msg:'wrong credentials'})
                }else{
                    const access_token=jwt.sign({userID:user._id,email:email},'namrata',{expiresIn:60*60*24})

                    redis.setex(email, 86400, access_token);//use setex and in this if two obj has same key then previous obj gets replaced with new obj
                    res.status(200).json({msg:'login successfull',access_token,user})
                }
            })
        }else{
            res.status(200).json({msg:'sign up please'})
        }
    }
    catch(err)
    {
        console.log(err)
        res.status(400).json({error:err})
    }
})

userRouter.get('/logout/:email',async(req,res)=>{
    const {email}=req.params
    try{
   await redis.del(email)
   res.status(200).json({msg:"logout successfull"})    
    }
    catch(err)
    {
        console.log(err)
        res.status(400).json({error:err})
    }
})




userRouter.get('/:email', auth, async (req, res) => {
    const email = req.params.email;
    try {
        const user = await UserModel.findOne({ email });
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

userRouter.get('/update/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const user = await UserModel.findOneAndUpdate({ _id:id }, { verify: true }, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ msg: 'Profile updated', user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

userRouter.get('/verify/:id',auth,async(req,res)=>{
    const  id=req.params.id
    const user=await UserModel.findOne({_id:id})
    const email=user.email
      await  verification(id,email,res);
})

userRouter.patch('/update-avatar/:id',auth,upload.single('avatar'),async(req,res)=>{
    const _id=req.params.id
    const avatar =req.file.path
try{
await UserModel.findByIdAndUpdate(_id,{avatar})
res.status(200).json({msg:'avatar updated'})
}
catch(err)
{
    res.status(400).json({error:err})
}
})




module.exports={
    userRouter
}
