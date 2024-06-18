import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { JWT_EXPIRY_TIME } from '../constants';

interface IPayload {
  username: string;
}

const githubAuth = (req: Request, res: Response) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;
  res.json({ success: true, url: githubAuthUrl });
};

const callback = async (req: Request, res: Response) => {
  try {
    console.log("request got !!")
    const result = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: req.query.code
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    const githubAccessToken = result.data.access_token;
    const apiUrl = 'https://api.github.com/user';

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`
      }
    });

    const currentUser = await User.findOne({ username: response.data.login });

    const payload: IPayload = { username: response.data.login };
    const userAccessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: JWT_EXPIRY_TIME
    });

    if (currentUser) {
      await User.findOneAndUpdate(
        { username: response.data.login },
        { gitHubToken: githubAccessToken },
        { new: true }
      );
    } else {
      const newUser = new User({
        name: response.data.name || 'GitHub User',
        username: response.data.login,
        gitHubToken: githubAccessToken
      });
      await newUser.save();
    }
    const option = {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000)
    }

    res.cookie('accessToken', userAccessToken, option);
    res.json({ success: true, token: userAccessToken });
  } catch (error) {
    //console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong !!',
      error: error
    });
  }
};

export { callback, githubAuth };
