import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TagSelector } from './TagSelector';

// since TagSelector uses localStorage, clear it before each test
beforeEach(() => {
  localStorage.clear();
});

describe('TagSelector', () => {
  it('shows predefined tags and a create option', () => {
    const onChange = vi.fn();
    render(<TagSelector value="personal" onValueChange={onChange} />);

    // predefined label must appear
    expect(screen.getByText(/Personal/i)).toBeInTheDocument();
    // create new option should be present after opening dropdown
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText(/\+ Create new tag/i)).toBeInTheDocument();
  });

  it('allows creating a custom tag and selects it', () => {
    const onChange = vi.fn();

    render(<TagSelector value="personal" onValueChange={onChange} />);
    fireEvent.click(screen.getByRole('combobox'));

    // open "create new" option
    fireEvent.click(screen.getByText(/\+ Create new tag/i));

    // dialog inputs
    const nameInput = screen.getByLabelText(/Name/i);
    const colorSelect = screen.getByLabelText(/Color/i);
    fireEvent.change(nameInput, { target: { value: 'Urgent' } });
    fireEvent.change(colorSelect, { target: { value: 'red' } });

    // submit
    fireEvent.click(screen.getByText(/^Create$/i));

    // onChange should be called with generated key
    expect(onChange).toHaveBeenCalledWith('urgent');
    // custom tag should now appear in dropdown
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('persists tag color across remounts', () => {
    const onChange = vi.fn();
    const { unmount } = render(<TagSelector value="personal" onValueChange={onChange} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText(/\+ Create new tag/i));
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Later' } });
    fireEvent.change(screen.getByLabelText(/Color/i), { target: { value: 'blue' } });
    fireEvent.click(screen.getByText(/^Create$/i));

    // confirm color class exists in dropdown
    fireEvent.click(screen.getByRole('combobox'));
    const item = screen.getByText('Later').closest('div');
    expect(item).toHaveClass('bg-blue-500');

    // simulate leaving page
    unmount();

    // re-render fresh component
    const { getByRole } = render(<TagSelector value="personal" onValueChange={onChange} />);
    fireEvent.click(getByRole('combobox'));
    const item2 = screen.getByText('Later').closest('div');
    expect(item2).toHaveClass('bg-blue-500');
  });
});