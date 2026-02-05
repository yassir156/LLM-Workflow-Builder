import type { LLMConfig } from '@/types';

export interface LLMResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

export class LLMService {
  async callLLM(config: LLMConfig, input: string): Promise<LLMResponse> {
    switch (config.provider) {
      case 'openrouter':
        return this.callOpenRouter(config, input);
      case 'gemini':
        return this.callGemini(config, input);
      case 'huggingface':
        return this.callHuggingFace(config, input);
      default:
        return { text: '', error: 'Unknown provider' };
    }
  }

  private async callOpenRouter(config: LLMConfig, input: string): Promise<LLMResponse> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: config.prompt },
            { role: 'user', content: input },
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { text: '', error: `OpenRouter API error: ${error}` };
      }

      const data = await response.json();
      return {
        text: data.choices[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      return { text: '', error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  private async callGemini(config: LLMConfig, input: string): Promise<LLMResponse> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: config.prompt },
                  { text: input },
                ],
              },
            ],
            generationConfig: {
              temperature: config.temperature,
              maxOutputTokens: config.maxTokens,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return { text: '', error: `Gemini API error: ${error}` };
      }

      const data = await response.json();
      return {
        text: data.candidates[0]?.content?.parts[0]?.text || '',
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      return { text: '', error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  private async callHuggingFace(config: LLMConfig, input: string): Promise<LLMResponse> {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${config.model}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            inputs: `${config.prompt}\n\n${input}`,
            parameters: {
              temperature: config.temperature,
              max_new_tokens: config.maxTokens,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return { text: '', error: `HuggingFace API error: ${error}` };
      }

      const data = await response.json();
      
      // HuggingFace returns different formats depending on the model
      let text = '';
      if (Array.isArray(data) && data.length > 0) {
        text = data[0].generated_text || data[0].text || '';
      } else if (data.generated_text) {
        text = data.generated_text;
      }

      return {
        text,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      return { text: '', error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  // Test connection to verify API key
  async testConnection(config: LLMConfig): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.callLLM(config, 'Hello, this is a test message.');
      
      if (response.error) {
        return { success: false, message: response.error };
      }
      
      return { success: true, message: 'Connection successful! API key is valid.' };
    } catch (error) {
      return { 
        success: false, 
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

export const llmService = new LLMService();
