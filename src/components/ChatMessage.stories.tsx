import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessage } from './ChatMessage';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/ChatMessage',
  component: ChatMessage,
  parameters: {
    // Optional parameter to center the component in the Canvas
    layout: 'padded',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    sender: { control: 'text' },
    message: { control: 'text' },
    characterName: { control: 'text' },
    isOwn: { control: 'boolean' },
  },
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const OwnMessage: Story = {
  args: {
    sender: 'You',
    message: 'I rolled a natural 20 on my perception check!',
    timestamp: new Date(),
    isOwn: true,
  },
};

export const OtherUserMessage: Story = {
  args: {
    sender: 'Dungeon Master',
    message: 'You notice a hidden door in the north wall.',
    timestamp: new Date(),
    isOwn: false,
  },
};

export const WithCharacterName: Story = {
  args: {
    sender: 'Alice',
    characterName: 'Eldrin the Wise',
    message: 'I cast fireball at the goblin horde!',
    timestamp: new Date(),
    isOwn: false,
  },
};

export const LongMessage: Story = {
  args: {
    sender: 'Bob',
    characterName: 'Thorin Stonehammer',
    message:
      'As I approach the ancient dragon, I raise my hammer high and shout a battle cry that echoes through the cavern. My dwarven ancestors watch over me as I prepare to strike!',
    timestamp: new Date(),
    isOwn: true,
  },
};

export const WithoutTimestamp: Story = {
  args: {
    sender: 'Carol',
    characterName: 'Lyra Moonwhisper',
    message: 'I attempt to sneak past the guards.',
    isOwn: false,
  },
};
