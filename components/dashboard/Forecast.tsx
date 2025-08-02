'use client';

import { TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ForecastResponse {
  forecast: string;
  error?: string;
}

interface ForecastData {
  ds: string[];
  y: number[];
}

export default function Forecast(): React.JSX.Element {
  const [forecast, setForecast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastModel, setLastModel] = useState<string | null>(null);

  const callForecastAPI = async (
    model: 'prophet' | 'neural_prophet',
    data: ForecastData
  ): Promise<string> => {
    const response = await fetch('/api/forecast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };
      throw new Error(errorData.error ?? 'Failed to generate forecast');
    }

    const result = (await response.json()) as ForecastResponse;

    if (result.error) {
      throw new Error(result.error);
    }

    return result.forecast;
  };

  const getDemoForecast = (model: 'prophet' | 'neural_prophet'): string => {
    const modelName = model === 'prophet' ? 'Prophet' : 'Neural Prophet';

    return `${modelName} Forecast Results:

**Historical Data Analysis:**
- Time Period: 2023-01-01 to 2023-05-01
- Growth Trend: +60% (10 → 18)
- Seasonality: Detected monthly patterns

**6-Month Predictions:**
- June 2023: $19,500 ± $2,100
- July 2023: $21,200 ± $2,300  
- August 2023: $22,800 ± $2,500
- September 2023: $24,100 ± $2,700
- October 2023: $25,600 ± $2,900
- November 2023: $27,000 ± $3,100

**Key Insights:**
✓ Strong upward trend continues
✓ 95% confidence intervals included
✓ ${model === 'neural_prophet' ? 'Deep learning patterns detected' : 'Classical time series analysis'}
✓ Recommended review in 30 days

**Model Performance:**
- MAE: 1.2k
- RMSE: 1.8k
- R²: 0.94${model === 'neural_prophet' ? '\n- Neural network accuracy: 96.2%' : ''}

Note: This is a demo forecast. Connect your data for real predictions.`;
  };

  const getForecast = async (model: 'prophet' | 'neural_prophet'): Promise<void> => {
    setLoading(true);
    setError(null);
    setLastModel(model);

    const sampleData: ForecastData = {
      ds: ['2023-01-01', '2023-02-01', '2023-03-01', '2023-04-01', '2023-05-01'],
      y: [10000, 12000, 15000, 13000, 18000],
    };

    try {
      let result: string;

      // Try API call first
      try {
        result = await callForecastAPI(model, sampleData);
      } catch (apiError) {
        // Fall back to demo forecast
        console.warn('Forecast API failed, using demo forecast:', apiError);
        setError(apiError instanceof Error ? apiError.message : 'API Error');
        result = getDemoForecast(model);
      }

      setForecast(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      setForecast(getDemoForecast(model));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (): React.JSX.Element | null => {
    if (loading) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Generating...
        </Badge>
      );
    }

    if (error) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          API Error
        </Badge>
      );
    }

    if (forecast) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {lastModel === 'prophet' ? 'Prophet' : 'Neural Prophet'}
        </Badge>
      );
    }

    return null;
  };

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Cost Forecast
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="mb-4 flex gap-2">
          <Button
            onClick={() => void getForecast('prophet')}
            disabled={loading}
            variant={lastModel === 'prophet' ? 'default' : 'outline'}
          >
            {loading && lastModel === 'prophet' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Prophet Forecast'
            )}
          </Button>
          <Button
            onClick={() => void getForecast('neural_prophet')}
            disabled={loading}
            variant={lastModel === 'neural_prophet' ? 'default' : 'outline'}
          >
            {loading && lastModel === 'neural_prophet' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Neural Prophet Forecast'
            )}
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="mr-1 inline h-4 w-4" />
              API Error: Using demo forecast. {error}
            </p>
          </div>
        )}

        {forecast && (
          <div className="flex-1 overflow-auto">
            <pre className="h-full overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
              {forecast}
            </pre>
          </div>
        )}

        {!forecast && !loading && (
          <div className="flex flex-1 items-center justify-center text-center">
            <div className="text-muted-foreground">
              <TrendingUp className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="mb-2 text-lg font-medium">Generate a Cost Forecast</p>
              <p className="text-sm">
                Choose a forecasting model to predict future employee costs and trends.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
