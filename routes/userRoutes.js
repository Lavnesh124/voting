const express = require('express')
const router = express();
const User=require('./../models/user');
const {jwtAuthMiddleware,generateToken}=require('./../jwt');



router.post('/signup',async (req,res)=>{
   //console.log("reached");
    try{
      const data=req.body //Assuming the request body constanin the person data
  
      //Create a new User document using the Mongoose model
      const newUser=new User(data);
    
      const response=await newUser.save();
      console.log("data saved");

      const payload ={
        id: response.id,
      }

      console.log(JSON.stringify(payload));

      const token=generateToken(payload);
      console.log("Token is : ",token);
      res.status(200).json({response:response,token:token});
    }
    catch(err){
      console.log(err);
      res.status(500).json({error:"Internal Server Error"});
    }
  })

  router.post('/login',async(req,res)=>{
    try{
        //Extract username and passoword from request body
        const {aadharCardNumber,password}=req.body;

        //Find the user by username
        const  user= await User.findOne({aadharCardNumber:aadharCardNumber});

        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error:'Invalid username or Password'});
        }

        //generate Token
        const payload={
            id: user.id,

        }
        const token =generateToken(payload);

        //return  token as response
        res.json({token:token});

    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});

    }
  })

  //Profile route 
  router.get('/profile',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userData=req.user;
      //  console.log("User data :",userData);

        const userId=userData.id;
        const  user=await User.findById(userId);

        res.status(200).json(user);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
  })


router.put('/profile/password',async(req,res)=>{
    try{
        const userId =req.user.id;
        const {currentPassword,newPassword}=req.body;


  //find user by id
   const user =await User.findById(userId);


   //if password does not match,return error
   if(!(await user.comparePassword(currentPassword))){
    return res.status(401).json({error:'Invalid username or Password'});
   }

      user.password=newPassword;
      await user.save();
        console.log("password updated");
        res.status(200).json({message:"Password update"});


    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});

    }
})
  


  


  module.exports=router;