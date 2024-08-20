import express from "express"
import { Creator } from "../models/creator.model.js"
import { Post } from "../models/post.model.js";
import { postRequest } from "../models/postRequest.model.js";
import jwt from "jsonwebtoken";
import { authMiddlewareCreator } from "../middlewares/authorization.js";


const router = express.Router();
router
    .post('/signin', async (req, res)=>{
        console.log(req);
        const {name, address, instagramUrl, youtubeUrl, phoneNo, category, password} = req.body;
        const existedUser = await Creator.findOne({
            $or: [{ address: address }]
        })
        if(existedUser){
            const token = jwt.sign({
                userId: existedUser.id,
            }, process.env.JWT_SECRET)

            res.json({token});
        } else {
            const creator = await Creator.create({
                name,
                address,
                instagramUrl,
                youtubeUrl,
                phoneNo,
                category,
                password
            })
            const token = jwt.sign({
                userId: creator.id,
            }, process.env.JWT_SECRET_CREATOR)

            res.redirect(201, 'http://localhost:3000/Creator');
        }
    })
router
    .post('/request/:postId', async(req, res)=>{
        console.log(req.body);
        const {note} = req.body;
        if(!note){
            res.status(401).send("Note is required")
        }
        const postrequest = await postRequest.create({
            note,
            createdBy: "66c4b184f902930284f12e5e",
            requestdOn: req.params.postId,
        })
        if(!postrequest){
            res.status(401).send("error in postRequest - try again leter ! !")
        }

        const post = await Post.find({_id: req.params.postId});

        const updatedCreator = await Creator.updateOne({_id: req.creatorId}, {$inc: { pendingAmount: post[0].price}});
        res.status(201).send(updatedCreator);
    })
router
    .get('/allpost', authMiddlewareCreator, async (req, res)=>{
        const allpost = await Post.find();
        if(!allpost){
            res.status(401).send("No Active Post At This Time")
        }
        res.status(201).json(allpost);
    })
router
    .get('/post/:postId', async(req, res)=>{
        const postId = req.query.postId;
        const postDetails = await Post.find({_id: postId});
        if(!postDetails){
            res.status(401).send("Dont have access to this task / No POST ! !")
        }
        res.status(201).json(postDetails);
    })
router
    .get('/profile',authMiddlewareCreator, async(req, res)=>{
        const creatorId = req.creatorId;
        const creatorDetails = await Creator.find({_id: creatorId});
        if(!creatorDetails){
            res.status(401).send("Dont have any Creator with ihis ID")
        }
        res.status(201).json(creatorDetails);
    })
export default router; 