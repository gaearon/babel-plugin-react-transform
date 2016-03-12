import React from 'react';

const First = React.createNotClass({
  displayName: 'First'
});

class Second extends React.NotComponent {}

var Third = (function () {
  function Third() {
  }
  return Third;
})();

var Fourth = (function () {
  function Fourth() {
  }
  Fourth.prototype.notrender = function () {};
  return Fourth;
})();

var Fifth = (function (_super) {
  __extends(Fifth, _super);
  function Fifth() {
    _super.apply(this, arguments);
  }
  return Fifth;
})(React.NotComponent);

var Sixth;

Sixth = (function(superClass) {
  extend(Sixth, superClass);

  function Sixth() {
    return Sixth.__super__.constructor.apply(this, arguments);
  }

  return Sixth;

})(React.NotComponent);

var Seventh = (function() {
  return 7;
})();

const myCreateClass = spec => {
  return React.createClass(spec);
};

const spec = {
  render: function () {}
};

React.createClass(spec);