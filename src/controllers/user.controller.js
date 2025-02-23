import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Meeting } from "../models/meeting.model.js";


const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "username password not given" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "user not found!" })
        }

        let isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "password is wrong!" });
        }

        let token = createSecretToken(user.username);
        user.token = token;
        await user.save();
        res.status(httpStatus.OK).json({ token: token });

    } catch (e) {
        res.json({ message: e.message });
    }
}

const register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "user already exists" });
        }

        const hashedPassword = await hash(password, 10);
        const newUser = await new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "User Registered ! " });
    } catch (e) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `something went wrong ${e}` });
    }
}

const createSecretToken = (id) => {
    return jwt.sign({ id }, 'shhhhh', {
        expiresIn: 3 * 24 * 60 * 60,
    });
};


const getAllRooms = async (req, res) => {
    console.log('getall rooms called !');
    try {
        const { user_id } = req.body;
        const user = await User.findOne({ username: user_id })
            .populate('joined_meetings')
            .populate('created_meetings')
            .exec();

        const joined_meetings = user.joined_meetings;
        const created_meetings = user.created_meetings;

        const meetings = [...created_meetings, ...joined_meetings]
        if (!meetings) return res.status(httpStatus.NOT_FOUND).json({ message: 'no meetings found !', success: false });
        return res.status(httpStatus.OK).json({ success: true, rooms: meetings });
    } catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
}
export { login, register, getAllRooms };