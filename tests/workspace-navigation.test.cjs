const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {workspaceViews,workspaceUrl,readWorkspaceLocation}=require('../src/lib/workspace-navigation.ts');
test('workspace navigation restores each screen and exact deal across refresh and history URLs',()=>{
 for(const view of workspaceViews){const id=view==='detail'?'deal-test /?&id=other':null;const url=new URL(workspaceUrl(view,id),'http://localhost');assert.equal(url.pathname,'/dashboard');assert.deepEqual(readWorkspaceLocation(url.search),{view,dealId:id});}
});
test('invalid views and missing deal links resolve safely without selecting another deal',()=>{
 assert.deepEqual(readWorkspaceLocation('?view=https://other.example'),{view:'overview',dealId:null});
 assert.deepEqual(readWorkspaceLocation('?view=detail'),{view:'deals',dealId:null});
 assert.deepEqual(readWorkspaceLocation('?view=splits&deal=unrelated'),{view:'splits',dealId:null});
 assert.equal(workspaceUrl('detail'),'/dashboard?view=deals');
});
