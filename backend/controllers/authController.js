import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const user = await User.findOne({ email }).populate('tenant_id');
        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({
            id: user._id,
            email: user.email,
            role: user.role,
            tenant_id: user.tenant_id._id,
            tenant_slug: user.tenant_id.slug
        }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                tenant: {
                    id: user.tenant_id._id,
                    slug: user.tenant_id.slug,
                    name: user.tenant_id.name,
                    subscription_plan: user.tenant_id.subscription_plan
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('tenant_id');
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            id: user._id,
            email: user.email,
            role: user.role,
            tenant: {
                id: user.tenant_id._id,
                slug: user.tenant_id.slug,
                name: user.tenant_id.name,
                subscription_plan: user.tenant_id.subscription_plan
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
