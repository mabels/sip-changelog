import { assert } from 'chai';
import { Message } from '../src/header-lines/message';

describe('git-message', () => {

  it('text-pre-line', () => {
    const msg = new Message();
    msg.push(' ');
    msg.push('    m  ');
    msg.push('    n ');
    assert.equal(msg.text(), 'm\nn');
  });

  it('text-line', () => {
    const msg = new Message();
    msg.push('    m');
    msg.push('    n   ');
    assert.equal(msg.text(), 'm\nn');
  });

  it('text-empty-line', () => {
    const msg = new Message();
    msg.push('    m');
    msg.push('       ');
    msg.push('    n   ');
    assert.equal(msg.text(), 'm\n\nn');
  });

  it('text-pre-post-line', () => {
    const msg = new Message();
    msg.push(' ');
    msg.push('    m');
    msg.push('    n');
    msg.push('');
    assert.equal(msg.text(), 'm\nn');
  });

  it('excerpt-pre-line', () => {
    const msg = new Message();
    msg.push(' ');
    msg.push('    m');
    msg.push('    n');
    assert.equal(msg.excerpt(), 'm');
  });

  it('excerpt-pre-line', () => {
    const msg = new Message();
    msg.push(' ');
    msg.push('     ');
    msg.push('    n');
    assert.equal(msg.excerpt(), 'n');
  });

  it('excerpt-pre-line', () => {
    const msg = new Message();
    msg.push(' ');
    msg.push('     ');
    msg.push('     has a default value, or a boolean option (which is automatically set to false even if');
    assert.equal(msg.excerpt(), 'has a default value, or a boolean option (which is automa...');
  });

});
