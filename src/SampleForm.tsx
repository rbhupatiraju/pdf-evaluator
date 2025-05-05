import React, { useState } from 'react';
import { 
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Stack,
  TextField,
  Typography
} from '@/components/ui/alert';

const PromptGenerator = () => {
  const [inputSentence, setInputSentence] = useState('');
  const [promptType, setPromptType] = useState('creative');
  const [promptTone, setPromptTone] = useState('neutral');
  const [detailLevel, setDetailLevel] = useState(5);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const promptTypes = [
    { value: 'creative', label: 'Creative Writing' },
    { value: 'technical', label: 'Technical Documentation' },
    { value: 'marketing', label: 'Marketing Copy' },
    { value: 'academic', label: 'Academic Writing' }
  ];

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const generatePrompt = () => {
    if (!inputSentence) return;

    let prompt = '';
    const detailDescriptor = detailLevel <= 3 ? 'brief' : detailLevel >= 8 ? 'highly detailed' : 'moderately detailed';
    
    switch (promptType) {
      case 'creative':
        prompt = `Write a ${detailDescriptor} ${promptTone} creative piece based on this concept: "${inputSentence}"`;
        break;
      case 'technical':
        prompt = `Create a ${detailDescriptor} ${promptTone} technical explanation about: "${inputSentence}"`;
        break;
      case 'marketing':
        prompt = `Generate ${detailDescriptor} ${promptTone} marketing content for: "${inputSentence}"`;
        break;
      case 'academic':
        prompt = `Compose a ${detailDescriptor} ${promptTone} academic analysis regarding: "${inputSentence}"`;
        break;
      default:
        prompt = `Write about: "${inputSentence}"`;
    }

    if (tags.length > 0) {
      prompt += ` Include elements related to: ${tags.join(', ')}.`;
    }

    setGeneratedPrompt(prompt);
  };

  return (
    <Container maxWidth="md" className="py-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-blue-50">
          <Typography variant="h5" className="text-blue-800 font-bold text-center">
            Sentence to Prompt Generator
          </Typography>
        </CardHeader>
        <CardContent>
          <Box className="space-y-6">
            <TextField
              label="Enter your sentence"
              variant="outlined"
              fullWidth
              value={inputSentence}
              onChange={(e) => setInputSentence(e.target.value)}
              className="mb-4"
              placeholder="Type a sentence to transform into a prompt..."
            />

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel>Prompt Type</FormLabel>
                  <Select
                    value={promptType}
                    onChange={(e) => setPromptType(e.target.value)}
                  >
                    {promptTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Tone</FormLabel>
                  <RadioGroup
                    row
                    value={promptTone}
                    onChange={(e) => setPromptTone(e.target.value)}
                  >
                    <FormControlLabel value="neutral" control={<Radio />} label="Neutral" />
                    <FormControlLabel value="enthusiastic" control={<Radio />} label="Enthusiastic" />
                    <FormControlLabel value="formal" control={<Radio />} label="Formal" />
                    <FormControlLabel value="casual" control={<Radio />} label="Casual" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>

            <Box>
              <Typography gutterBottom>Detail Level</Typography>
              <Slider
                value={detailLevel}
                min={1}
                max={10}
                step={1}
                marks
                onChange={(e, newValue) => setDetailLevel(newValue)}
                valueLabelDisplay="auto"
                className="mb-4"
              />
            </Box>

            <Box>
              <Typography gutterBottom>Tags (Optional)</Typography>
              <Stack direction="row" spacing={2} className="mb-2">
                <TextField
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tags"
                  size="small"
                  className="flex-grow"
                />
                <Button
                  variant="contained"
                  onClick={handleAddTag}
                  disabled={!currentTag}
                  className="bg-blue-500"
                >
                  Add
                </Button>
              </Stack>
              
              <Box className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    className="bg-blue-100"
                  />
                ))}
              </Box>
            </Box>

            <Box className="flex justify-center">
              <Button
                variant="contained"
                onClick={generatePrompt}
                disabled={!inputSentence}
                className="bg-blue-600 hover:bg-blue-700 w-1/2 py-3"
                size="large"
              >
                Generate Prompt
              </Button>
            </Box>

            {generatedPrompt && (
              <Box className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Typography variant="subtitle1" className="font-semibold mb-2">
                  Generated Prompt:
                </Typography>
                <Typography className="whitespace-pre-wrap">
                  {generatedPrompt}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PromptGenerator;
