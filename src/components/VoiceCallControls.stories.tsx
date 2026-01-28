import type { Meta, StoryObj } from '@storybook/react';
import { VoiceCallControls } from './VoiceCallControls';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/VoiceCallControls',
  component: VoiceCallControls,
  parameters: {
    // Optional parameter to center the component in the Canvas
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    isMuted: { control: 'boolean' },
    isInCall: { control: 'boolean' },
    isSpeakerOn: { control: 'boolean' },
  },
  // Use action callbacks for the onClick handlers
  args: {
    onMuteToggle: () => console.log('Mute toggled'),
    onCallToggle: () => console.log('Call toggled'),
    onSpeakerToggle: () => console.log('Speaker toggled'),
  },
} satisfies Meta<typeof VoiceCallControls>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const NotInCall: Story = {
  args: {
    isInCall: false,
    isMuted: false,
    isSpeakerOn: true,
  },
};

export const InCallUnmuted: Story = {
  args: {
    isInCall: true,
    isMuted: false,
    isSpeakerOn: true,
  },
};

export const InCallMuted: Story = {
  args: {
    isInCall: true,
    isMuted: true,
    isSpeakerOn: true,
  },
};

export const InCallSpeakerOff: Story = {
  args: {
    isInCall: true,
    isMuted: false,
    isSpeakerOn: false,
  },
};

export const AllMuted: Story = {
  args: {
    isInCall: true,
    isMuted: true,
    isSpeakerOn: false,
  },
};
