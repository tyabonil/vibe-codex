#!/usr/bin/env node

const { program } = require('commander');
const BalanceBot = require('../src/bots/balance-bot');
const { getFiles, readFileSafe } = require('../src/utils/analysis');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');

const bot = new BalanceBot();

program
  .name('balance-bot')
  .description('The Pragmatic Mediator - Provides balanced solutions biased toward actual impact')
  .version('1.0.0')
  .argument('[paths...]', 'Files or directories to review', '.')
  .option('-e, --extensions <exts...>', 'File extensions to include', ['.js', '.ts', '.jsx', '.tsx', '.md', '.json', '.sh'])
  .option('-i, --ignore <patterns...>', 'Patterns to ignore', ['node_modules', '.git', 'dist', 'build'])
  .option('-o, --output <file>', 'Output report to file')
  .option('--no-color', 'Disable colored output')
  .action(async (paths, options) => {
    if (options.noColor) {
      chalk.level = 0;
    }

    const spinner = ora('Finding files to analyze pragmatically...').start();
    
    try {
      // Collect all files to analyze
      const allFiles = [];
      
      for (const inputPath of paths) {
        const fullPath = path.resolve(inputPath);
        const stats = await require('fs').promises.stat(fullPath).catch(() => null);
        
        if (!stats) {
          spinner.fail(`Path not found: ${inputPath}`);
          process.exit(1);
        }
        
        if (stats.isDirectory()) {
          const files = await getFiles(fullPath, options.extensions);
          allFiles.push(...files);
        } else if (stats.isFile()) {
          allFiles.push(fullPath);
        }
      }
      
      // Filter out ignored patterns
      const filesToReview = allFiles.filter(file => {
        return !options.ignore.some(pattern => file.includes(pattern));
      });
      
      spinner.succeed(`Found ${filesToReview.length} files to analyze`);
      
      if (filesToReview.length === 0) {
        console.log(chalk.yellow('No files found matching criteria.'));
        process.exit(0);
      }
      
      // Read and analyze files
      console.log(chalk.cyan('\nPerforming balanced analysis...\n'));
      
      const fileContents = [];
      for (const file of filesToReview) {
        const result = await readFileSafe(file);
        if (result.content !== null) {
          fileContents.push({ path: file, content: result.content });
        } else {
          console.log(chalk.red(`⚠️  Skipping ${file}: ${result.error}`));
        }
      }
      
      // Analyze files
      const results = await bot.analyzeFiles(fileContents);
      
      // Generate report
      const report = bot.generateReport(results);
      
      // Output report
      if (options.output) {
        await require('fs').promises.writeFile(options.output, report);
        console.log(chalk.green(`\n✅ Report saved to: ${options.output}`));
      } else {
        console.log(report);
      }
      
    } catch (error) {
      spinner.fail('Analysis failed');
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });

program.parse();