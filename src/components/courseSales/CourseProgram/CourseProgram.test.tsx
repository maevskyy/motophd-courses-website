import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CourseProgram } from './CourseProgram';

const modules = [
  { number: '01', title: 'Level 01 — Theory', open: true, lessons: [{ name: 'Intro', order: 1, duration: '5 min' }] },
  { number: '02', title: 'Level 02 — Preparation', open: false, lessons: [] }
];

describe('CourseProgram', () => {
  it('lists the levels in order without lesson details or controls', () => {
    render(<CourseProgram modules={modules} />);

    const items = screen.getAllByRole('listitem');

    expect(items.map((item) => item.textContent)).toEqual([
      '01Level 01 — Theory',
      '02Level 02 — Preparation'
    ]);
    expect(screen.queryByText('Intro')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
