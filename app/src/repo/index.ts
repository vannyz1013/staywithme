// Picks the storage backend once, at import time.

import { isCloudConfigured } from '../config/supabase-config';
import { localRepo } from './local-repo';
import { supabaseRepo } from './supabase-repo';
import type { Repo } from './types';

export const repo: Repo = isCloudConfigured ? supabaseRepo : localRepo;
