const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const detect = require('language-detect');
const httpsProxyAgent = require('https-proxy-agent');

function configWithProxy(config) {
    var c = config || {};
    if (process.env.OPENAI_PROXY) {
        core.debug(`use proxy: ${process.env.OPENAI_PROXY}`);
        c.proxy = false;
        c.httpsAgent = new httpsProxyAgent(process.env.OPENAI_PROXY);
        return c;
    }
    return c;
}

async function run() {
  try {
    // Get input values
    const programmingLanguage = core.getInput('PROGRAMMING_LANGUAGE');
    const openaiToken = core.getInput('OPENAI_TOKEN');
    const fullReviewComment = core.getInput('FULL_REVIEW_COMMENT');
    const reviewCommentPrefix = core.getInput('REVIEW_COMMENT_PREFIX');
    const githubToken = core.getInput('GITHUB_TOKEN');
    const githubBaseURL = core.getInput('GITHUB_BASE_URL') || process.env.GITHUB_API_URL;
    const promptTemplate = core.getInput('PROMPT_TEMPLATE');
    const maxCodeLength = core.getInput('MAX_CODE_LENGTH');
    const answerTemplate = core.getInput('ANSWER_TEMPLATE');

    core.debug(`programmingLanguage: ${programmingLanguage}`);
    core.debug(`openaiToken length: ${openaiToken.length}`);
    core.debug(`fullReviewComment: ${fullReviewComment}`);
    core.debug(`reviewCommentPrefix: ${reviewCommentPrefix}`);
    core.debug(`githubToken length: ${githubToken.length}`);
    core.debug(`githubBaseURL: ${githubBaseURL}`);
    core.debug(`promptTemplate: ${promptTemplate}`);
    core.debug(`maxCodeLength: ${maxCodeLength}`);
    core.debug(`answerTemplate: ${answerTemplate}`);

    // Get information about the pull request review
    const comment = github.context.payload.comment;
    const repoName = github.context.payload.repository.name;
    const repoOwner = github.context.payload.repository.owner.login;
    const prNumber = github.context.payload.number || github.context.payload.issue.number; // get number from a pull request event or comment event

    // Get the code to analyze from the review comment
    var content = comment && comment.body || "";

    const url = `${githubBaseURL}/repos/${repoOwner}/${repoName}/pulls/${prNumber}`;
    core.debug(`diff url: ${url}`);
    var response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github.diff'
        }
    });
    const code = response.data;
    core.debug(`diff code: ${code}`);
    const files = parsePullRequestDiff(code);
    core.debug(`diff files: ${files}`);

    if (!content || content == fullReviewComment) {
        // Extract the code from the pull request content
        content = promptTemplate.replace('${code}', code);
    } else {
        content = content.substring(reviewCommentPrefix.length);
        content = content.replace('${code}', code);
        const fileNames = findFileNames(content);
        core.debug(`found files name in commment: ${fileNames}`);
        for (const fileName of fileNames) {
            for (const key of Object.keys(files)) {
                if (key.includes(fileName)) {
                    core.debug(`replace \${file:${fileName}} with ${key}'s diff`);
                    content = content.replace(`\${file:${fileName}}`, files[key]);
                    break;
                }
            }
        }
    }
    content = content.substring(0, maxCodeLength);

    // Determine the programming language if it was not provided
    if (programmingLanguage == 'auto') {
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

    core.debug(`content: ${content}`);

    // Call the OpenAI ChatGPT API to analyze the code
    response = await axios.post('https://api.openai.com/v1/chat/completions', {
        "model": "gpt-3.5-turbo",
        "messages": messages
    }, configWithProxy({
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiToken}`
      }
    }));

    const answer = response.data.choices[0].message.content;
    core.debug(`openai response: ${answer}`);

    // Reply to the review comment with the OpenAI response
    const octokit = github.getOctokit(githubToken, {
        baseUrl: githubBaseURL
    });
    await octokit.rest.issues.createComment({
        owner: repoOwner,
        repo: repoName,
        issue_number: prNumber,
        body: answerTemplate.replace('${answer}', answer)
        // in_reply_to: comment.id
      });
  } catch (error) {
    core.setFailed(error.message);
  }
}

function parsePullRequestDiff(diffContent) {
    const files = {};
    const diffLines = diffContent.split('\n');

    let currentFile = null;
    let currentLines = [];

    for (const line of diffLines) {
      if (line.startsWith('diff --git')) {
        // Start of a new file
        if (currentFile) {
          files[currentFile] = currentLines.join('\n');
        }
        currentFile = line.substring('diff --git'.length + 1);
        currentLines = [line];
      } else {
        // Add the line to the current file's diff
        currentLines.push(line);
      }
    }

    // Add the last file's diff
    if (currentFile) {
      files[currentFile] = currentLines.join('\n');
    }

    return files;
}

function findFileNames(str) {
    const pattern = /\${file:([^{}]+)}/g;
    const matches = str.matchAll(pattern);
    const names = [];
    for (const match of matches) {
      names.push(match[1]);
    }
    return names;
}

run();
