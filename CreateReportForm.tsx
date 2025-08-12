import React from 'react';
import { z } from 'zod';
import { Form, FormItem, FormLabel, FormControl, FormMessage, useForm } from './Form';
import { Input } from './Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { Spinner } from './Spinner';
import { useFilms } from '../helpers/filmQueries';
import { useDebounce } from '../helpers/useDebounce';
import { ReportFocusAreaArrayValues, FOCUS_AREA_LABELS, ReportFocusAreaType } from '../helpers/reportSchema';

const createReportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  focusArea: z.string().min(1, 'Focus area is required'),
  opponentName: z.string().min(1, 'Opponent name is required'),
  gameIds: z.array(z.number()).min(1, 'At least one game must be selected'),
});

interface CreateReportFormProps {
  onSubmit: (data: z.infer<typeof createReportSchema>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CreateReportForm: React.FC<CreateReportFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const form = useForm({
    schema: createReportSchema,
    defaultValues: {
      title: '',
      focusArea: 'formation_tendencies',
      opponentName: '',
      gameIds: []
    }
  });

  const [focusAreaMode, setFocusAreaMode] = React.useState<'preset' | 'custom'>('preset');
  const [customFocusArea, setCustomFocusArea] = React.useState('');
  const [opponentSearch, setOpponentSearch] = React.useState('');
  
  // Debounce the search to prevent excessive API calls
  const debouncedOpponentSearch = useDebounce(opponentSearch, 300);

  const { data: films = [], isFetching: isLoadingFilms } = useFilms({
    opponent: debouncedOpponentSearch || undefined
  }, {
    enabled: debouncedOpponentSearch.length > 0
  });

  const handleOpponentChange = (value: string) => {
    // Update form state for validation and submission
    form.setValues(prev => ({
      ...prev,
      opponentName: value
    }));
    // Update search state for API calls
    setOpponentSearch(value);
  };

  // Clear games when opponent search changes
  React.useEffect(() => {
    // reset selected games only when the debounced opponent actually changes
    form.setValues(prev => (prev.gameIds.length ? { ...prev, gameIds: [] } : prev));
  }, [debouncedOpponentSearch, form.setValues]);

  const toggleGame = (gameId: number) => {
    form.setValues(prev => ({
      ...prev,
      gameIds: prev.gameIds.includes(gameId)
        ? prev.gameIds.filter(id => id !== gameId)
        : [...prev.gameIds, gameId]
    }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <FormItem name="title">
          <FormLabel>Report Title</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter report title"
              value={form.values.title}
              onChange={(e) => form.setValues(prev => ({ ...prev, title: e.target.value }))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="focusArea">
          <FormLabel>Focus Area</FormLabel>
          <FormControl>
            <Select
              value={focusAreaMode === 'preset' ? form.values.focusArea : 'custom'}
              onValueChange={(value) => {
                if (value === 'custom') {
                  setFocusAreaMode('custom');
                  form.setValues(prev => ({ ...prev, focusArea: customFocusArea }));
                } else {
                  setFocusAreaMode('preset');
                  form.setValues(prev => ({ ...prev, focusArea: value }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select focus area" />
              </SelectTrigger>
              <SelectContent>
                {ReportFocusAreaArrayValues.map((area) => (
                  <SelectItem key={area} value={area}>
                    {FOCUS_AREA_LABELS[area]}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Other (Custom)</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>

        {focusAreaMode === 'custom' && (
          <FormItem name="focusArea">
            <FormLabel>Custom Focus Area</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g., Third down conversions in the red zone against press coverage, Goal line defense against heavy personnel packages, Play action effectiveness on first down..."
                value={customFocusArea}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomFocusArea(value);
                  form.setValues(prev => ({ ...prev, focusArea: value }));
                }}
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}

        <FormItem name="opponentName">
          <FormLabel>Opponent Name</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter opponent name"
              value={form.values.opponentName}
              onChange={(e) => handleOpponentChange(e.target.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        {form.values.opponentName && (
          <FormItem name="gameIds">
            <FormLabel>Select Games ({films.length} available)</FormLabel>
            <FormControl>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'var(--spacing-3)' }}>
                {isLoadingFilms ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                    <Spinner size="sm" />
                    <span>Loading games...</span>
                  </div>
                ) : films.length === 0 ? (
                  <div style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                    No games found for this opponent
                  </div>
                ) : (
                  films.map((film) => (
                    <label
                      key={film.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-2)',
                        cursor: 'pointer',
                        padding: 'var(--spacing-2)',
                        borderRadius: 'var(--radius)',
                        transition: 'background-color var(--animation-duration-fast) ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--muted)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.values.gameIds.includes(film.id)}
                        onChange={() => toggleGame(film.id)}
                        style={{ margin: 0 }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{film.title}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                          {new Date(film.gameDate).toLocaleDateString()}
                        </span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}

        <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end', marginTop: 'var(--spacing-4)' }}>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size="sm" />
                Creating...
              </>
            ) : (
              'Create Report'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};