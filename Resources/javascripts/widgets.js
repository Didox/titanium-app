/*
 * Only use this file if you want to replace AbrilID widgets.
 * Is still a early version, so there is a lot to be improved.
 */

var fakeAbrilIdEventManager = {};
fakeAbrilIdEventManager.listenTo = function() { };

window.abrilIdEventManager = fakeAbrilIdEventManager;

var fakeAbrilIDWidget = {};
fakeAbrilIDWidget.state = {};
fakeAbrilIDWidget.state.nome = "LOGADO";

window.topo = fakeAbrilIDWidget;
