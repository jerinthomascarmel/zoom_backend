import { Meeting } from "../models/meeting.model.js";
import { User } from "../models/user.model.js";
import { v4 as uuidv4 } from 'uuid';
import httpStatus from "http-status";

const createRoom = async (req, res) => {
    try {
        const { user_id } = req.body;
        const newRoomId = uuidv4();
        const roomExist = await Meeting.findOne({ meetingCode: newRoomId });
        if (roomExist) {
            return res.status(httpStatus.FOUND).json({ message: "meeting Room already exists!", success: false });
        }

        const newMeeting = new Meeting({
            user_id: user_id,
            meetingCode: newRoomId,
            date: new Date()
        });
        await newMeeting.save();

        //add the meeting to user
        const user = await User.findOne({ username: user_id })
        user.created_meetings.push(newMeeting);
        await user.save();

        return res.status(httpStatus.OK).json({ success: true, meetingCode: newRoomId });
    } catch (err) {
        console.log(err.message);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message, success: false })
    }
}


const joinRoom = async (req, res) => {
    console.log('join room called ', req.body)
    try {
        const { roomId, username } = req.body;
        const roomExist = await Meeting.findOne({ meetingCode: roomId });
        const user = await User.findOne({ username })
        if (roomExist) {
            if (roomExist.user_id != user.username) {
                user.joined_meetings.push(roomExist);
                await user.save();
            }
            return res.status(httpStatus.OK).json({ message: "meeting Room already exists!", success: true });
        }

        return res.status(httpStatus.NOT_FOUND).json({ message: 'this room not found', success: false })
    } catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message, success: false })
    }
}


const getAllMessages = async (req, res) => {
    try {
        const { roomId } = req.body;
        const messageList = await Meeting.findOne({ meetingCode: roomId }).populate('messages');
        // console.log(messageList);
        return res.status(httpStatus.OK).json({ messageList: messageList.messages, success: true });
    } catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false })
    }

}


export { createRoom, joinRoom, getAllMessages };

