const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {workspaceViews,workspaceUrl,readWorkspaceLocation}=require('../src/lib/workspace-navigation.ts');
const {dealSections,readDealSection}=require('../src/lib/workspace-navigation.ts');
const {hasUnreviewedDraft,emptyDeliverableDraft}=require('../src/lib/deliverable-draft.ts');
test('deal section links survive refresh and ignore invalid or unrelated sections',()=>{
 for(const section of dealSections) {
  const url=new URL(workspaceUrl('detail','deal /&',section),'http://localhost');
  assert.equal(readDealSection(url.search),section);
  assert.equal(readWorkspaceLocation(url.search).dealId,'deal /&');
 }
 for(const search of ['?view=detail&deal=a&section=unknown','?view=deals&section=invoices','?view=detail&section=activity']) assert.equal(readDealSection(search),null);
 assert.equal(workspaceUrl('overview',null,'activity'),'/dashboard?view=overview');
});
test('only unsaved evidence warns; new edits made after submitting remain unsaved',()=>{
 assert.equal(hasUnreviewedDraft(emptyDeliverableDraft),false);
 const sent={transcript:'Sponsor text',description:'Description',videoUrl:'https://example.test/video'};
 assert.equal(hasUnreviewedDraft(sent),true);
 assert.equal(hasUnreviewedDraft({...sent},sent),false);
 for(const field of ['transcript','description','videoUrl']) assert.equal(hasUnreviewedDraft({...sent,[field]:sent[field]+' edit'},sent),true);
});
test('workspace navigation restores each screen and exact deal across refresh and history URLs',()=>{
 for(const view of workspaceViews){const id=view==='detail'?'deal-test /?&id=other':null;const url=new URL(workspaceUrl(view,id),'http://localhost');assert.equal(url.pathname,'/dashboard');assert.deepEqual(readWorkspaceLocation(url.search),{view,dealId:id});}
});
test('invalid views and missing deal links resolve safely without selecting another deal',()=>{
 assert.deepEqual(readWorkspaceLocation('?view=https://other.example'),{view:'overview',dealId:null});
 assert.deepEqual(readWorkspaceLocation('?view=detail'),{view:'deals',dealId:null});
 assert.deepEqual(readWorkspaceLocation('?view=splits&deal=unrelated'),{view:'splits',dealId:null});
 assert.equal(workspaceUrl('detail'),'/dashboard?view=deals');
});
