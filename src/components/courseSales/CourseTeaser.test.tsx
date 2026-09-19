import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CourseTeaser } from './CourseTeaser';

describe('CourseTeaser', () => {
  it('renders the heading and the Stream iframe when a teaser url is given', () => {
    render(
      <CourseTeaser
        courseTitle="Lean"
        embedUrl="https://customer-abc.cloudflarestream.com/vid/iframe"
        title="Watch a preview"
      />
    );

    expect(screen.getByRole('heading', { name: 'Watch a preview' })).toBeInTheDocument();
    expect(screen.getByTitle('Watch a preview — Lean')).toHaveAttribute(
      'src',
      'https://customer-abc.cloudflarestream.com/vid/iframe'
    );
  });

  it('renders nothing without a teaser url', () => {
    const { container } = render(<CourseTeaser courseTitle="Lean" embedUrl={null} title="Watch a preview" />);

    expect(container).toBeEmptyDOMElement();
  });
});
