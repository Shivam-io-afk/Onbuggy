import { Request, Response } from 'express';
import { ContactMessage } from '../models/ContactMessage';

// @desc    Submit a contact form / issue report
// @route   POST /api/contact
// @access  Public
export const submitContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, topic, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({
        success: false,
        message: 'Please provide your name, email, and message description',
      });
      return;
    }

    const contactEntry = await ContactMessage.create({
      name,
      email,
      topic: topic || 'General Inquiry',
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been received! Our support team will get in touch soon.',
      data: contactEntry,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

