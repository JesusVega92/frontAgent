import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Space } from '@/models/Space';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDB();
    
    const space = await Space.findById(id).populate('occupiedBy', 'name email');
    
    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }
    
    return NextResponse.json(space);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch space' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== 'admin' && userRole !== 'dev') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();
    
    const space = await Space.findById(id);
    
    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    const userId = session.user.id;
    const userName = session.user.name || session.user.email || 'Unknown';

    if (space.isOccupied) {
      const isOwner = space.occupiedBy?.toString() === userId;
      const isAdmin = userRole === 'admin';

      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { error: 'You can only release your own spaces' },
          { status: 403 }
        );
      }

      space.isOccupied = false;
      space.occupiedBy = null;
      space.occupiedByName = null;
    } else {
      space.isOccupied = true;
      space.occupiedBy = new mongoose.Types.ObjectId(userId);
      space.occupiedByName = userName;
    }

    await space.save();
    return NextResponse.json(space);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to toggle space' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== 'admin' && userRole !== 'dev') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();
    
    const space = await Space.findByIdAndDelete(id);
    
    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Space deleted successfully' });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete space' },
      { status: 500 }
    );
  }
}