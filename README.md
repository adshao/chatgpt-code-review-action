### Simplify code reviews, just say `chatgpt`!

# OpenAI ChatGPT Code Review

A GitHub Action that uses OpenAI ChatGPT to analyze code in pull request comments.

## Usage

To use this action in your workflow, add the following step:

```yaml
name: OpenAI ChatGPT Code Review
uses: adshao/chatgpt-code-review-action@v0.2
with:
    PROGRAMMING_LANGUAGE: 'JavaScript'
    REVIEW_COMMENT_PREFIX: 'chatgpt:'
    FULL_REVIEW_COMMENT: 'chatgpt'
    OPENAI_TOKEN: ${{ secrets.OPENAI_TOKEN }}
    GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
```

## Inputs

This action accepts the following inputs:

- `PROGRAMMING_LANGUAGE` (optional): The programming language of the code in the GitHub repository. If not provided, the detected programming language will be used.
- `OPENAI_TOKEN` (required): The API token for the OpenAI ChatGPT API.
- `GITHUB_TOKEN` (required): The API token for the Github API.
- `FULL_REVIEW_COMMENT` (required): The comment to trigger code review for the pull request.
- `REVIEW_COMMENT_PREFIX` (required): The comment prefix to trigger code review with the comment.
- `GITHUB_BASE_URL` (optional): The base URL for the GitHub API.
- `MAX_CODE_LENGTH` (optional): The maximum code length for the pull request code to be sent to OpenAI. The default value is 6000.
- `PROMPT_TEMPLATE` (optional): The template for the FULL_REVIEW_COMMENT prompt. The default value is:
```
Please analyze the pull request's code and inform me whether it requires optimization, and provide an explanation for your decision:

${code}
```
- `ANSWER_TEMPLATE` (optional): The template for the answer sent to the GitHub comment. The default value is:
```
AI Code Review:

${answer}
```

## Outputs

This action does not produce any outputs.

## Example workflow

Here's an example workflow that uses this action to analyze code in pull request comments:

```yaml
name: Code Review

on:
  issue_comment:
    types: [created, edited]

jobs:
  code-review:
    runs-on: ubuntu-latest
    if: github.event.comment.user.login == 'adshao' && startsWith(github.event.comment.body, 'chatgpt')
    steps:
    - name: OpenAI ChatGPT Code Review
      uses: adshao/chatgpt-code-review-action@v0.2
      with:
        PROGRAMMING_LANGUAGE: 'JavaScript'
        OPENAI_TOKEN: ${{ secrets.OPENAI_TOKEN }}
        GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
        FULL_REVIEW_COMMENT: 'chatgpt'
        REVIEW_COMMENT_PREFIX: 'chatgpt:'
```

This workflow runs the `OpenAI ChatGPT Code Review` action when a pull request comment is created or edited. The action uses the `PROGRAMMING_LANGUAGE`, `FULL_REVIEW_COMMENT`, `REVIEW_COMMENT_PREFIX`, `OPENAI_TOKEN` and `GITHUB_TOKEN` input values to analyze the code in the pull request comment.

* If the comment starts with `chatgpt:` and is sent by `adshao`, the workflow will be triggered.

* If the comment is exactly `chatgpt`, it will trigger a code review for the diff of the pull request.

* You can also trigger github action when a pull request opened.

![demo](https://pbs.twimg.com/media/FqOsplnaMAERrgP?format=jpg&name=large)


## More Examples

`go-binance`: https://github.com/adshao/go-binance/pull/461#issuecomment-1452922849

## License

The code in this repository is licensed under the MIT license. See `LICENSE` for more information.
