import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock fetch globally
global.fetch = jest.fn();

import Forecast from './Forecast';

describe('Forecast component', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the forecast buttons', () => {
    render(<Forecast />);
    expect(screen.getByText('Prophet Forecast')).toBeInTheDocument();
    expect(screen.getByText('Neural Prophet Forecast')).toBeInTheDocument();
  });

  it('calls /api/forecast when Prophet Forecast button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: (): Promise<{ forecast: string }> =>
        Promise.resolve({ forecast: 'Prophet Forecast Data' }),
    } as Response);

    render(<Forecast />);
    fireEvent.click(screen.getByText('Prophet Forecast'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'prophet',
          data: {
            ds: ['2023-01-01', '2023-02-01', '2023-03-01', '2023-04-01', '2023-05-01'],
            y: [10000, 12000, 15000, 13000, 18000],
          },
        }),
      });
      expect(screen.getByText('Prophet Forecast Data')).toBeInTheDocument();
    });
  });

  it('calls /api/forecast when Neural Prophet Forecast button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: (): Promise<{ forecast: string }> =>
        Promise.resolve({ forecast: 'Neural Prophet Forecast Data' }),
    } as Response);

    render(<Forecast />);
    fireEvent.click(screen.getByText('Neural Prophet Forecast'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'neural_prophet',
          data: {
            ds: ['2023-01-01', '2023-02-01', '2023-03-01', '2023-04-01', '2023-05-01'],
            y: [10000, 12000, 15000, 13000, 18000],
          },
        }),
      });
      expect(screen.getByText('Neural Prophet Forecast Data')).toBeInTheDocument();
    });
  });

  it('shows demo forecast when API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    render(<Forecast />);
    fireEvent.click(screen.getByText('Prophet Forecast'));

    await waitFor(() => {
      expect(screen.getByText(/Prophet Forecast Results:/)).toBeInTheDocument();
      expect(screen.getByText(/API Error: Using demo forecast/)).toBeInTheDocument();
    });
  });

  it('shows loading state while generating forecast', async () => {
    mockFetch.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: (): Promise<{ forecast: string }> =>
                  Promise.resolve({ forecast: 'Test Forecast' }),
              } as Response),
            100
          )
        )
    );

    render(<Forecast />);
    fireEvent.click(screen.getByText('Prophet Forecast'));

    expect(screen.getAllByText('Generating...')).toHaveLength(2); // Badge and button both show "Generating..."

    await waitFor(() => {
      expect(screen.getByText('Test Forecast')).toBeInTheDocument();
    });
  });
});
