const express = require('express')
const router = express();
const User=require('../models/user');
const {jwtAuthMiddleware,generateToken}=require('../jwt');
const Candidate = require('../models/candidate');



const checkAdminRole = async (userID)=>{
   try{
      const user= await User.findById(userID);
      if(user.role ==='admin'){
        return true;
      }
   }
   catch(err){
     return false;
   }
}



//POST routes to add  a  candidate 
router.post('/',jwtAuthMiddleware,async (req,res)=>{
   //console.log("reached");
    try{

      if(!(await checkAdminRole(req.user.id)) ){
       // console.log("no admin");
        return res.status(403).json({message:"user do not have  admin role"});
      }

       const data=req.body //Assuming the request body constanin the person data
  
      //Create a new User document using the Mongoose model
      const newCandidate=new Candidate(data);
    
      const response=await newCandidate.save();
      console.log("data saved");

      res.status(200).json({response:response});
    }
    catch(err){
      console.log(err);
      res.status(500).json({error:"Internal Server Error"});
    }
  })

router.put('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
     if(! (await checkAdminRole(req.user.userId))){
        return res.status(403).json({message:"user do not have  admin role"});
      }


        const candidateID =req.params.candidateID;
        const updateCandidateData=req.body;

        const response =await Candidate.findByIdAndUpdate(candidateID,updateCandidateData,{
          new:true,
          runValidators:true,
        })

        if(!response){
          return res.status(404).json({error:'Candidate  not found'});
        }
        console.log("candidate data updated");
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});

    }
})


router.delete('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
  try{

   if(!(await checkAdminRole(req.user.userId))){
      return res.status(403).json({message:"user do not have  admin role"});
    }

      const candidateID =req.params.candidateID;

      const response =await Candidate.findByIdAndDelete(candidateID)

      if(!response){
        return res.status(404).json({error:'Candidate  not found'});
      }
      console.log("candidate data delete");
      res.status(200).json(response);
  }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});

  }
})


//let's  start voting
router.post('/vote/:candidateID',jwtAuthMiddleware, async (req,res)=>{

      //no admin can vote
      //user can only vote ones

      const candidateID=req.params.candidateID;
     const  userId=req.user.id;

      try{
        // Find the candidate document with the specified condidateID
         const candidate=await Candidate.findById(candidateID);
           if(!candidate){
              return res.status(404).json({message:'Candidate not found'});
           }
         const user=await User.findById(userId);  
         if(!user){
            return res.status(404).json({message:'user not found'});
         }
         if(user.isVoted){
          return res.status(400).json({message:"user has allready voted"});
         }
         if(user.role=='admin'){
          return res.status(403).json({message:"admin is not allowed to  vote"});
         }
//Updating the candidate document to record the vote
         candidate.votes.push({user:userId});
         candidate.voteCount++;
         await candidate.save();

         //update the user documet 
         user.isVoted=true;
         await user.save();

         res.status(200).json({message:"Vote recorded successfully"});
      }
      catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});

      }
});


//vote count
router.get('/voteCount', async (req, res) => {
  try{
      // Find all candidates and sort them by voteCount in descending order
      const candidate = await Candidate.find().sort({voteCount: 'desc'});

      // Map the candidates to only return their name and voteCount
      const voteRecord = candidate.map((data)=>{
          return {
              party: data.party,
              count: data.voteCount
          }
      });

      return res.status(200).json(voteRecord);
  }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
  }
});

router.get('/candidate',async(req,res)=>{
  try{
    const candidate = await Candidate.find();
    const candidateRecord = candidate.map((data)=>{
      return {
          name: data.name,
          party: data.party
      }
  });
  return res.status(200).json(candidateRecord);

  }
  catch(err){
    console.log(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
})
  


  module.exports=router;