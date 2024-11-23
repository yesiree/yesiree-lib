# @yesiree/pid

Create PIDs (public IDs) as unique as a UUID but shorter (25 characters). They
are URL-safe, more readable, and more copiable (no hypens!).

## Examples

```javascript
import { createPid } from '@yesiree/pid'

const pid = createPid()
console.log(pid)
```
