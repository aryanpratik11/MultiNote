import Tenant from '../models/Tenant.js';

export const upgradeTenant = async (req, res) => {
  try {
    const { slug } = req.params;
    if (req.user.tenant_slug !== slug) return res.status(403).json({ error: 'Access denied' });

    const tenant = await Tenant.findOneAndUpdate(
      { slug },
      { subscription_plan: 'pro' },
      { new: true }
    );

    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    res.json({ message: 'Subscription upgraded to Pro' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
