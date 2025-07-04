#!/usr/bin/env node

const { program } = require('commander');
const HaterBot = require('../src/bots/hater-bot');
const WhiteKnightBot = require('../src/bots/white-knight-bot');
const BalanceBot = require('../src/bots/balance-bot');
const { getFiles, readFileSafe } = require('../src/utils/analysis');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');

program
  .name('review-bots')
  .description('Run all three review bots (Hater, White Knight, and Balance) on your code')
  .version('1.0.0')
  .argument('[paths...]', 'Files or directories to review', '.')
  .option('-e, --extensions <exts...>', 'File extensions to include', ['.js', '.ts', '.jsx', '.tsx', '.md', '.json', '.sh'])
  .option('-i, --ignore <patterns...>', 'Patterns to ignore', ['node_modules', '.git', 'dist', 'build'])
  .option('-o, --output <file>', 'Output report to file')
  .option('-b, --bot <bot>', 'Run specific bot only (hater, white-knight, balance)', '')
  .option('--separate', 'Show each bot report separately')
  .option('--no-color', 'Disable colored output')
  .action(async (paths, options) => {
    if (options.noColor) {
      chalk.level = 0;
    }

    const spinner = ora('Finding files to review...').start();
    
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
      
      spinner.succeed(`Found ${filesToReview.length} files to review`);
      
      if (filesToReview.length === 0) {
        console.log(chalk.yellow('No files found matching criteria.'));
        process.exit(0);
      }
      
      // Read files
      console.log(chalk.cyan('\nReading files...\n'));
      
      const fileContents = [];
      for (const file of filesToReview) {
        const result = await readFileSafe(file);
        if (result.content !== null) {
          fileContents.push({ path: file, content: result.content });
        } else {
          console.log(chalk.red(`⚠️  Skipping ${file}: ${result.error}`));
        }
      }
      
      // Determine which bots to run
      let bots = [];
      if (options.bot) {
        switch (options.bot.toLowerCase()) {
          case 'hater':
            bots = [{ name: 'Hater Bot', instance: new HaterBot() }];
            break;
          case 'white-knight':
            bots = [{ name: 'White Knight Bot', instance: new WhiteKnightBot() }];
            break;
          case 'balance':
            bots = [{ name: 'Balance Bot', instance: new BalanceBot() }];
            break;
          default:
            console.error(chalk.red(`Unknown bot: ${options.bot}`));
            console.log('Available bots: hater, white-knight, balance');
            process.exit(1);
        }
      } else {
        bots = [
          { name: 'Hater Bot', instance: new HaterBot() },
          { name: 'White Knight Bot', instance: new WhiteKnightBot() },
          { name: 'Balance Bot', instance: new BalanceBot() }
        ];
      }
      
      // Run analyses
      let fullReport = '';
      
      for (const bot of bots) {
        console.log(chalk.cyan(`\nRunning ${bot.name}...\n`));
        const results = await bot.instance.analyzeFiles(fileContents);
        const report = bot.instance.generateReport(results);
        
        if (options.separate) {
          console.log(report);
          console.log('\n' + '='.repeat(80) + '\n');
        }
        
        fullReport += report + '\n\n';
      }
      
      // Output combined report
      if (!options.separate) {
        console.log(chalk.bold.cyan('\n📊 COMBINED ANALYSIS REPORT\n'));
        console.log(fullReport);
      }
      
      if (options.output) {
        await require('fs').promises.writeFile(options.output, fullReport);
        console.log(chalk.green(`\n✅ Report saved to: ${options.output}`));
      }
      
      // Summary
      if (bots.length > 1) {
        console.log(chalk.bold.yellow('\n🎯 EXECUTIVE SUMMARY:\n'));
        console.log('1. The Hater Bot found everything wrong (as expected)');
        console.log('2. The White Knight Bot defended everything (as expected)');
        console.log('3. The Balance Bot told you what actually matters (listen to this one)');
        console.log('\nRemember: Perfect code doesn\'t ship. Good enough code that solves problems does.');
      }
      
    } catch (error) {
      spinner.fail('Analysis failed');
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });

program.parse();