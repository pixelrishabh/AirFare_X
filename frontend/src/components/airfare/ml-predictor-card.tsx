import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { airfareApi, type PredictionResult } from '@/services/api'
import { formatINR } from '@/lib/utils/format'
import { IconSparkles, IconAlertTriangle, IconCheck, IconCpu, IconInfoCircle } from '@tabler/icons-react'

const AIRPORTS = [
  { code: 'DEL', city: 'Delhi (DEL)' },
  { code: 'BOM', city: 'Mumbai (BOM)' },
  { code: 'BLR', city: 'Bengaluru (BLR)' },
  { code: 'CCU', city: 'Kolkata (CCU)' },
  { code: 'HYD', city: 'Hyderabad (HYD)' },
  { code: 'MAA', city: 'Chennai (MAA)' },
  { code: 'PNQ', city: 'Pune (PNQ)' },
  { code: 'AMD', city: 'Ahmedabad (AMD)' },
  { code: 'COK', city: 'Kochi (COK)' },
]

const AIRLINES = [
  { code: '6E', name: 'IndiGo (6E)' },
  { code: 'AI', name: 'Air India (AI)' },
  { code: 'IX', name: 'Air India Express (IX)' },
  { code: 'QP', name: 'Akasa Air (QP)' },
  { code: 'SG', name: 'SpiceJet (SG)' },
]

export function MLPredictorCard() {
  const [origin, setOrigin] = useState('DEL')
  const [destination, setDestination] = useState('BOM')
  const [airline, setAirline] = useState('6E')
  
  const defaultDepDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const [departureDate, setDepartureDate] = useState(defaultDepDate)
  const [advanceDays, setAdvanceDays] = useState(15)
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDateChange = (dateStr: string) => {
    setDepartureDate(dateStr)
    if (dateStr) {
      const dep = new Date(dateStr)
      const today = new Date()
      const diffTime = dep.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setAdvanceDays(diffDays > 0 ? diffDays : 0)
    }
  }

  const handlePredict = async () => {
    if (origin === destination) {
      setError('Origin and Destination cannot be the same airport.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const result = await airfareApi.predictFare({
        origin,
        destination,
        airline,
        departure_date: departureDate,
        advance_days: advanceDays,
      })
      setPrediction(result)
    } catch (err: any) {
      setError(err?.message || 'Failed to generate ML airfare prediction.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='border-primary/30 shadow-md relative overflow-hidden'>
      <div className='absolute top-0 right-0 p-3 opacity-10 pointer-events-none'>
        <IconCpu className='size-32 text-primary' />
      </div>

      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <IconSparkles className='size-5 text-primary animate-pulse' />
            <CardTitle className='text-base font-bold'>Smart ML Airfare Predictor</CardTitle>
          </div>
          <Badge variant='secondary' className='font-mono text-xs gap-1 bg-primary/10 text-primary border-primary/20'>
            <IconCpu className='size-3.5' />
            <span>RandomForest Pipeline</span>
          </Badge>
        </div>
        <CardDescription className='text-xs mt-1'>
          Real-time price forecasting & lead-time yield recommendation powered by scikit-learn ML model.
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Input Controls */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3'>
          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold'>Origin Airport</Label>
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger className='text-xs h-9'>
                <SelectValue placeholder='Select Origin' />
              </SelectTrigger>
              <SelectContent>
                {AIRPORTS.map((a) => (
                  <SelectItem key={'orig-' + a.code} value={a.code} className='text-xs'>
                    {a.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold'>Destination Airport</Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className='text-xs h-9'>
                <SelectValue placeholder='Select Destination' />
              </SelectTrigger>
              <SelectContent>
                {AIRPORTS.map((a) => (
                  <SelectItem key={'dest-' + a.code} value={a.code} className='text-xs'>
                    {a.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold'>Airline Carrier</Label>
            <Select value={airline} onValueChange={setAirline}>
              <SelectTrigger className='text-xs h-9'>
                <SelectValue placeholder='Select Airline' />
              </SelectTrigger>
              <SelectContent>
                {AIRLINES.map((al) => (
                  <SelectItem key={'airl-' + al.code} value={al.code} className='text-xs'>
                    {al.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold'>Departure Date</Label>
            <Input
              type='date'
              value={departureDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className='text-xs h-9 font-mono'
            />
          </div>
        </div>

        {error && (
          <div className='p-2.5 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs flex items-center gap-2'>
            <IconAlertTriangle className='size-4 shrink-0' />
            <span>{error}</span>
          </div>
        )}

        <Button
          onClick={handlePredict}
          disabled={loading}
          className='w-full font-semibold gap-2 shadow-sm'
        >
          {loading ? (
            <>
              <IconSparkles className='size-4 animate-spin' />
              <span>Running ML Model Pipeline...</span>
            </>
          ) : (
            <>
              <IconSparkles className='size-4' />
              <span>Forecast Airfare ({origin} to {destination})</span>
            </>
          )}
        </Button>

        {/* Prediction Results Display */}
        {prediction && (
          <div className='p-4 rounded-xl border bg-card/60 backdrop-blur-sm space-y-3.5 mt-2 animate-in fade-in duration-300'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3'>
              <div>
                <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>ML Predicted Domestic Fare</span>
                <div className='flex items-baseline gap-2 mt-0.5'>
                  <span className='text-3xl font-extrabold tracking-tight text-primary font-mono'>
                    {formatINR(prediction.prediction || prediction.predicted_fare)}
                  </span>
                  <span className='text-xs text-muted-foreground font-mono'>INR</span>
                </div>
              </div>

              <div className='flex flex-col items-start sm:items-end gap-1'>
                <Badge variant='outline' className='bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-mono font-bold gap-1'>
                  <IconCheck className='size-3.5' />
                  <span>{prediction.recommendation}</span>
                </Badge>
                <span className='text-[11px] text-muted-foreground font-mono'>
                  Confidence Score: {(prediction.confidence_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-xs'>
              <div className='p-2.5 rounded-lg border bg-muted/30 space-y-0.5'>
                <span className='text-muted-foreground text-[11px]'>Price Range Bound</span>
                <div className='font-mono font-semibold'>
                  {formatINR(prediction.lower_bound)} - {formatINR(prediction.upper_bound)}
                </div>
              </div>

              <div className='p-2.5 rounded-lg border bg-muted/30 space-y-0.5'>
                <span className='text-muted-foreground text-[11px]'>Booking Window</span>
                <div className='font-mono font-semibold'>T+{prediction.advance_days} Days Lead</div>
              </div>

              <div className='p-2.5 rounded-lg border bg-muted/30 space-y-0.5'>
                <span className='text-muted-foreground text-[11px]'>Carrier Selected</span>
                <div className='font-mono font-semibold truncate'>{prediction.airline_name || prediction.airline}</div>
              </div>

              <div className='p-2.5 rounded-lg border bg-muted/30 space-y-0.5'>
                <span className='text-muted-foreground text-[11px]'>ML Model Pipeline</span>
                <div className='font-mono font-semibold truncate'>{prediction.model_version}</div>
              </div>
            </div>

            <div className='flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t'>
              <div className='flex items-center gap-1.5'>
                <IconInfoCircle className='size-3.5 text-primary' />
                <span>Model: {prediction.model}</span>
              </div>
              <span className='font-mono'>Status: {prediction.status.toUpperCase()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
