import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Invitation } from '@/models/Invitation';
import { User } from '@/models/User';
import { sendInvitationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const invitations = await Invitation.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role = 'user' } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const existingInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (existingInvitation) {
      return NextResponse.json({ error: 'Pending invitation already exists for this email' }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const invitation = await Invitation.create({
      email: email.toLowerCase(),
      role,
      token,
      expiresAt,
      createdBy: session.user.id,
    });

    const adminUser = await User.findById(session.user.id);
    await sendInvitationEmail({
      email,
      token,
      invitedByName: adminUser?.name || 'Admin',
    });

    return NextResponse.json({ 
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      }
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}