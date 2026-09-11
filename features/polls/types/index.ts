// Poll domain types derived from DB schema
export interface Poll {
  id: string;
  userId: string;
  question: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  createdAt: Date;
}

export interface PollVote {
  id: string;
  pollId: string;
  pollOptionId: string;
  userId: string;
  createdAt: Date;
}

export interface PollWithOptions extends Poll {
  options: PollOption[];
}

export interface PollWithDetails extends Poll {
  options: (PollOption & { votes: PollVote[] })[];
  votes: PollVote[];
}

export interface PollOptionInput {
  id?: string;
  text: string;
}
