// Legacy package without "exports" gets file extensions
import omit from 'legacy/omit';
import dir from 'legacy/dir';
// Package with "exports" stays untouched
import sub from 'modern/sub';
// Package root stays untouched
import pkg from '@scope/pkg';

console.log(omit, dir, sub, pkg);
