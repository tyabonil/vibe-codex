# LLM-OPTIMIZED RULES (TOKENIZED)

## PARSE_PRIORITY: MANDATORY > WORKFLOW > QUALITY > PATTERNS

### L1_SECURITY [NON_NEGOTIABLE]
```
NEVER: commit_secrets | overwrite_env | hardcode_credentials
ALWAYS: env_variables | .env.example | ask_before_env_changes
TRIGGER: any_file_containing(api_key|password|token|secret) → IMMEDIATE_STOP
```

### L2_WORKFLOW [MANDATORY]
```
SEQUENCE: issue → branch → PR → merge
TOOLS: mcp_github_* (remote) | terminal_git (local_only)
POST_MERGE: update_issues + close_completed + sync_branches + verify_clean
TOKEN_LIMIT: <40KB_total | eliminate_duplicates | consolidate_redundant
VALIDATION: pre_action_checklist + post_action_verification
TERMINAL: linux/posix_preferred | avoid_powershell | non_interactive_flags
BLOCKED: immediate_assign_to_owner | identify_alternatives
```

### L3_QUALITY [MANDATORY]
```
TESTS: 100%_coverage_required | no_exceptions | framework_appropriate
COPILOT: request_review_immediately + address_all_feedback + document_resolution
PR_FEEDBACK: read_all + address_all + implement_or_justify + respond_promptly
ISSUE_DOCS: document_thought_process + capture_external_llm + explain_reasoning
PROJECT_CONTEXT: update_for_significant_changes + include_implementation_approach
```

### L4_PATTERNS [RECOMMENDED]
```
CODE: simple > complex | avoid_duplication | environment_aware | files ≤300_lines
BRANCH: feature/issue-{number}-{description} | never_merge_to_main | use_preview
LLM_VALIDATION: consult_other_llm_for_plans + document_feedback_on_issue
```

## ENFORCEMENT_TRIGGERS

### PRE_ACTION_CHECKLIST
```
□ secrets_check → STOP_if_yes
□ env_overwrite_check → ASK_if_yes  
□ use_mcp_github → YES_for_remote
□ issue_exists → CREATE_if_no
□ correct_branch → VERIFY_not_main
□ workflow_rules_reviewed → MANDATORY
```

### POST_ACTION_VALIDATION
```
□ workflow_sequence_followed → VERIFY
□ mcp_vs_terminal_correct → VERIFY
□ violations_occurred → DOCUMENT
□ thought_process_documented → VERIFY
□ external_llm_consultations_captured → VERIFY
```

### PR_WORKFLOW_CHECKLIST
```
AFTER_PR_CREATION:
□ copilot_review_requested → MANDATORY
□ all_comments_monitoring → ACTIVE
□ all_failures_tracking → ACTIVE

WHEN_FEEDBACK_RECEIVED:
□ read_all_comments → HUMAN+BOT+AUTOMATED
□ address_all_failures → CI_CD+TESTS+LINT+BUILD
□ implement_fixes_or_justify → ALL_SUGGESTIONS
□ responsive_communication → PROFESSIONAL
□ update_pr_description → IF_SCOPE_CHANGED
```

### POST_MERGE_ACTIONS
```
□ related_issues_updated → COMMENT+STATUS
□ completed_issues_closed → IF_FULLY_RESOLVED
□ local_main_synced → 100%_ALIGNMENT
□ local_preview_synced → 100%_ALIGNMENT
□ working_directory_clean → VERIFIED
```

## VIOLATION_HANDLING
```
L1_VIOLATION: IMMEDIATE_STOP + NO_OVERRIDES_EVER
L2_VIOLATION: DOCUMENT + PREVENT_RECURRENCE + UPDATE_MEMORY
L3_VIOLATION: BLOCK_MERGE + RESOLVE_FIRST
L4_VIOLATION: RECOMMEND_FIX + LOG_IMPROVEMENT
```

## SUCCESS_METRICS
```
LEVEL_1: 0_security_incidents
LEVEL_2: 0_workflow_failures + 0_github_violations + 100%_branch_sync
LEVEL_3: 100%_quality_gates + 100%_feedback_responsiveness + complete_transparency
LEVEL_4: clean_maintainable_codebase + architectural_consistency
```

## QUICK_REFERENCE_PATTERNS
```
SECURITY: env_vars_only | never_commit_secrets | ask_before_env_changes
WORKFLOW: issue→branch→PR→merge | mcp_remote + terminal_local | post_merge_cleanup
QUALITY: 100%_tests + copilot_review + address_all_feedback + document_everything
PATTERNS: simple_code + preview_branch + llm_validation + thoughtful_implementation
```

## EMERGENCY_PROTOCOL
```
PRODUCTION_DOWN_ONLY:
✓ owner_approval_required
✓ technical_debt_issues_created_immediately
✓ quality_fixes_scheduled_24hrs
✓ override_reason_documented
✗ NO_L1_SECURITY_OVERRIDES_EVER
```