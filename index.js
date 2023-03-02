const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const detect = require('language-detect');

async function run() {
  try {
    // Get input values
    const language = core.getInput('LANGUAGE');
    const programmingLanguage = core.getInput('PROGRAMMING_LANGUAGE');
    const openaiToken = core.getInput('OPENAI_TOKEN');
    const reviewPrComment = core.getInput('REVIEW_PR_COMMENT');

    // Get information about the pull request review
    const issue = github.context.payload.issue;
    const comment = github.context.payload.comment;
    const repoName = github.context.payload.repository.name;
    const repoOwner = github.context.payload.repository.owner.login;
    const prNumber = issue.number;

    // Get the code to analyze from the review comment
    var content = comment.body;

    var code;

    if (content.startsWith(reviewPrComment)) {
        // Get the content of the pull request
        if (!code) {
            const response = await axios.get(issue.pull_request.diff_url);
            code = response.data;
        }
    
        // Extract the code from the pull request content
        content = `Please anayze the code of the pull request, tell me if the change is good and explain the reason in ${language}:\n\n\`\`\`${code}\`\`\``;
    }

    // Determine the programming language if it was not provided
    if (programmingLanguage == 'auto') {
        // Get the content of the pull request
        if (!code) {
            const response = await axios.get(issue.pull_request.diff_url);
            code = response.data;
        }
        const detectedLanguage = detect(code);
        core.debug(`Detected programming language: ${detectedLanguage}`);
        programmingLanguage = detectedLanguage;
    }

    var messages = [{
        role: "system",
        content: `You are a master of programming language ${programmingLanguage}`
    }, {
        role: "user",
        content: content
    }];

    core.debug(`messages: ${messages}`);

    // Call the OpenAI ChatGPT API to analyze the code
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        "model": "gpt-3.5-turbo",
        "messages": messages
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiToken}`
      }
    });

    // Reply to the review comment with the OpenAI response
    await github.request(`POST /repos/${repoOwner}/${repoName}/issues/${prNumber}/comments`, {
      body: response.data.choices[0].text,
      in_reply_to: comment.id
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
