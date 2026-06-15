#!/bin/sh
# Claude Code statusLine: dir + git + model | cost + burn rate + duration | context bar

command -v jq >/dev/null || { echo "jq missing"; exit 1; }

input=$(cat)

# Parse all JSON fields in a single jq call
eval "$(echo "$input" | jq -r '
  @sh "cwd=\(.workspace.current_dir // .cwd)",
  @sh "model=\(.model.display_name // empty)",
  @sh "cost=\(.cost.total_cost_usd // 0)",
  @sh "duration_ms=\(.cost.total_duration_ms // 0)",
  @sh "used_pct=\(.context_window.used_percentage // 0)",
  @sh "rl_5h_resets=\(.rate_limits.five_hour.resets_at // empty)",
  @sh "rl_7d_resets=\(.rate_limits.seven_day.resets_at // empty)",
  @sh "rl_5h_pct=\(.rate_limits.five_hour.used_percentage // empty)",
  @sh "rl_7d_pct=\(.rate_limits.seven_day.used_percentage // empty)"
')"

# Directory (abbreviate path: ~/P/G/neko-scripts)
case "$cwd" in
  "$HOME"*) short_cwd="~${cwd#"$HOME"}" ;;
  *) short_cwd="$cwd" ;;
esac
short_dir=$(echo "$short_cwd" | awk -F/ '{for(i=1;i<NF;i++) printf "%s/", substr($i,1,1); print $NF}')

# Git branch and status
git_info=""
if git -C "$cwd" rev-parse --git-dir > /dev/null 2>&1; then
  branch=$(git -C "$cwd" -c gc.auto=0 symbolic-ref --short HEAD 2>/dev/null \
           || git -C "$cwd" -c gc.auto=0 rev-parse --short HEAD 2>/dev/null)
  if [ -n "$branch" ]; then
    if ! git -C "$cwd" -c gc.auto=0 diff --quiet HEAD 2>/dev/null; then
      git_info=" $branch*"
    else
      git_info=" $branch"
    fi
  fi
fi

# Cost
cost_fmt=$(printf '$%.2f' "$cost")

# Duration (awk handles float from jq safely)
duration_s=$(echo "$duration_ms" | awk '{printf "%d", $1 / 1000}')
if [ "$duration_s" -ge 3600 ]; then
  dur_fmt=$(printf '%dh%02dm' $((duration_s / 3600)) $(((duration_s % 3600) / 60)))
elif [ "$duration_s" -ge 60 ]; then
  dur_fmt=$(printf '%dm%02ds' $((duration_s / 60)) $((duration_s % 60)))
else
  dur_fmt="${duration_s}s"
fi

# Burn rate ($/hr based on cost and duration)
burn=""
if [ "$duration_s" -gt 30 ]; then
  burn_hr=$(echo "$cost $duration_s" | awk '{printf "%.2f", ($1 / $2) * 3600}')
  burn="\$${burn_hr}/hr"
fi

# Context with color-coded threshold
used_int=$(printf '%.0f' "$used_pct")

if [ "$used_int" -lt 40 ]; then
  color="\033[32m"  # green
elif [ "$used_int" -lt 70 ]; then
  color="\033[33m"  # yellow
else
  color="\033[31m"  # red
fi
reset="\033[0m"

# Progress bar helper
make_bar() {
  pct_int=$(printf '%.0f' "$1")
  width="$2"
  filled=$((pct_int * width / 100))
  empty=$((width - filled))
  b=""
  i=0; while [ $i -lt $filled ]; do b="${b}█"; i=$((i + 1)); done
  i=0; while [ $i -lt $empty ]; do b="${b}░"; i=$((i + 1)); done
  printf '%s' "$b"
}

bar=$(make_bar "$used_pct" 10)

# Rate limits (5-hour and 7-day windows) — show time remaining until reset
fmt_remaining() {
  secs="$1"
  if [ "$secs" -le 0 ] 2>/dev/null; then
    printf '0m'
  elif [ "$secs" -ge 86400 ]; then
    printf '%dd' $((secs / 86400))
  elif [ "$secs" -ge 3600 ]; then
    printf '%dh' $((secs / 3600))
  else
    printf '%dm' $((secs / 60))
  fi
}

rl_color() {
  pct_int=$(printf '%.0f' "$1")
  if [ "$pct_int" -lt 50 ]; then
    printf '\033[32m'
  elif [ "$pct_int" -lt 75 ]; then
    printf '\033[33m'
  elif [ "$pct_int" -lt 90 ]; then
    printf '\033[35m'
  else
    printf '\033[31m'
  fi
}

now=$(date +%s)

# Format a rate limit segment: rl_segment <resets_at> <pct>
rl_segment() {
  resets="$1"; pct="$2"
  [ -z "$resets" ] || [ -z "$pct" ] && return 1
  secs_left=$((resets - now))
  time_str=$(fmt_remaining "$secs_left")
  c=$(rl_color "$pct")
  b=$(make_bar "$pct" 5)
  pct_int=$(printf '%.0f' "$pct")
  printf '%b%s %s %s%%%b' "$c" "$time_str" "$b" "$pct_int" "$reset"
}

rl_5h_str=$(rl_segment "$rl_5h_resets" "$rl_5h_pct")
rl_7d_str=$(rl_segment "$rl_7d_resets" "$rl_7d_pct")

rl_term=""
if [ -n "$rl_5h_str" ] && [ -n "$rl_7d_str" ]; then
  rl_term=" │ ${rl_5h_str}  ${rl_7d_str}"
elif [ -n "$rl_5h_str" ]; then
  rl_term=" │ ${rl_5h_str}"
elif [ -n "$rl_7d_str" ]; then
  rl_term=" │ ${rl_7d_str}"
fi

# Assemble
printf '%s%s  %s │ %s  %s  %s │ %b%s %s%%%b%b' \
  "$short_dir" "$git_info" "$model" \
  "$cost_fmt" "${burn:---}" "$dur_fmt" \
  "$color" "$bar" "$used_int" "$reset" \
  "$rl_term"
