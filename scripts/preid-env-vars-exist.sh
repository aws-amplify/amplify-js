if [ -z "$PREID_PREFIX" ]; then
  echo >&2 "Fatal error: PREID_PREFIX not set"
  exit 2
fi

if [ -z "$PREID_HASH_SUFFIX" ]; then
  echo >&2 "Fatal error: PREID_HASH_SUFFIX not set"
  exit 2
fi
