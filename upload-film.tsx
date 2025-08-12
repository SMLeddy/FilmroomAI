import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm, Form, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '../components/Form';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Popover, PopoverTrigger, PopoverContent } from '../components/Popover';
import { Calendar } from '../components/Calendar';
import { Calendar as CalendarIcon, Upload, ArrowLeft } from 'lucide-react';
import { VideoUpload, UploadStatus } from '../components/VideoUpload';
import { getVideoMetadata } from '../helpers/VideoProcessor';
import { useUploadFilmV2 } from '../helpers/useUploadFilmV2';
import { schema as filmCreateSchema } from '../endpoints/film-create_POST.schema';
import styles from './upload-film.module.css';

// Form schema without the file and calculated fields, which are handled separately
const formSchema = filmCreateSchema.omit({ 
  videoFileSize: true, 
  videoMimeType: true, 
  videoDurationSeconds: true,
    fileKey: true
});
type FormValues = z.infer<typeof formSchema>;

const UploadFilmPage = () => {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileError, setVideoFileError] = useState<string | null>(null);
  const uploadMutation = useUploadFilmV2();

  const form = useForm({
    schema: formSchema,
    defaultValues: {
      title: '',
      opponent: '',
      gameDate: undefined,
      homeTeam: '',
      awayTeam: '',
      analyzingTeam: '',
    },
  });

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleFileSelect = (file: File) => {
    // Client-side file size validation - now 10GB limit
    const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB in bytes
    
    if (file.size > MAX_FILE_SIZE) {
      setVideoFileError(`File too large (${formatBytes(file.size)}). Maximum size is 10GB. Please use a smaller file.`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setVideoFileError('Please select a valid video file.');
      return;
    }
    
    setVideoFile(file);
    setVideoFileError(null);
  };

  const handleFileClear = () => {
    setVideoFile(null);
    if (uploadMutation.isError) {
      uploadMutation.reset();
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!videoFile) {
      setVideoFileError('A video file is required.');
      return;
    }

    // Final client-side validation before upload attempt
    const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB in bytes
    if (videoFile.size > MAX_FILE_SIZE) {
      setVideoFileError(`File too large (${formatBytes(videoFile.size)}). Maximum size is 10GB. Please use a smaller file.`);
      return;
    }

    setVideoFileError(null);

    try {
      const { duration } = await getVideoMetadata(videoFile);
      uploadMutation.mutate({
        title: values.title,
        opponent: values.opponent,
        gameDate: values.gameDate,
        homeTeam: values.homeTeam,
        awayTeam: values.awayTeam,
        analyzingTeam: values.analyzingTeam,
        videoFile,
        videoDurationSeconds: duration,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not process video file.';
      setVideoFileError(message);
      console.error(message, error);
    }
  };
  
  useEffect(() => {
    if (uploadMutation.isSuccess) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [uploadMutation.isSuccess, navigate]);

  const uploadStatus: UploadStatus = uploadMutation.isPending ? 'processing'
    : uploadMutation.isSuccess ? 'success'
    : uploadMutation.isError ? 'error'
    : 'idle';

  const getStatusMessage = () => {
    if (uploadMutation.isPending) {
      const { progress } = uploadMutation.uploadProgress;
      if (progress < 10) {
        return 'Preparing upload...';
      } else if (progress < 95) {
        return 'Uploading to cloud storage...';
      } else {
        return 'Creating film record...';
      }
    }
    return uploadMutation.error?.message;
  };

  return (
    <>
      <Helmet>
        <title>Upload Game Film - Film.AI</title>
        <meta name="description" content="Upload new game film for analysis." />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.header}>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ArrowLeft size={16} /> Back to Dashboard</Link>
          </Button>
          <div className={styles.titleContainer}>
            <Upload size={24} className={styles.titleIcon} />
            <h1>Upload Game Film</h1>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.uploadSection}>
            <h2>1. Upload Video</h2>
            <VideoUpload
              file={videoFile}
              onFileSelect={handleFileSelect}
              onClear={handleFileClear}
              status={uploadStatus}
              errorMessage={getStatusMessage()}
              progress={uploadMutation.uploadProgress.progress}
            />
            {videoFileError && <p className={styles.fileError}>{videoFileError}</p>}
            {uploadMutation.isPending && (
              <div className={styles.uploadProgress}>
                <p className={styles.progressText}>
                  {getStatusMessage()} ({Math.round(uploadMutation.uploadProgress.progress)}%)
                </p>
              </div>
            )}
          </div>

          <div className={styles.formSection}>
            <h2>2. Add Game Details</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
                <FormItem name="title">
                  <FormLabel>Film Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Week 4 vs. Rivals"
                      value={form.values.title || ''}
                      onChange={(e) => form.setValues(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem name="opponent">
                  <FormLabel>Opponent</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., North High School"
                      value={form.values.opponent || ''}
                      onChange={(e) => form.setValues(prev => ({ ...prev, opponent: e.target.value }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem name="gameDate">
                  <FormLabel>Game Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={styles.datePickerTrigger}>
                          {form.values.gameDate ? form.values.gameDate.toLocaleDateString() : <span>Pick a date</span>}
                          <CalendarIcon size={16} />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent removeBackgroundAndPadding>
                      <Calendar
                        mode="single"
                        selected={form.values.gameDate}
                        onSelect={(date) => form.setValues(prev => ({ ...prev, gameDate: date as Date }))}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>

                <div className={styles.teamInputs}>
                  <FormItem name="homeTeam">
                    <FormLabel>Home Team</FormLabel>
                    <FormControl>
                      <Input value={form.values.homeTeam || ''} onChange={(e) => form.setValues(prev => ({ ...prev, homeTeam: e.target.value }))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormItem name="awayTeam">
                    <FormLabel>Away Team</FormLabel>
                    <FormControl>
                      <Input value={form.values.awayTeam || ''} onChange={(e) => form.setValues(prev => ({ ...prev, awayTeam: e.target.value }))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>

                <FormItem name="analyzingTeam">
                  <FormLabel>Team to Analyze</FormLabel>
                  <FormControl>
                    <Input placeholder="Which team's plays are being analyzed?" value={form.values.analyzingTeam || ''} onChange={(e) => form.setValues(prev => ({ ...prev, analyzingTeam: e.target.value }))} />
                  </FormControl>
                  <FormDescription>This is typically your own team or the opponent.</FormDescription>
                  <FormMessage />
                </FormItem>

                <Button type="submit" size="lg" className={styles.submitButton} disabled={uploadStatus === 'processing' || uploadStatus === 'success'}>
                  {uploadStatus === 'processing' ? getStatusMessage() : 'Upload and Save Film'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadFilmPage;