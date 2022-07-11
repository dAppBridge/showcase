"use strict";
var ScratchCards = {
    balance: window.remaining_balance,
    config: {
        //actionURL: 'http://127.0.0.1:444/',
        actionURL: 'https://api.tronwin.app:443/',
        balanceNameSingular: 'TRX',
        balanceNamePlural: 'TRX',
        scratchLineWidth: 65,
        cellCompletePercentage: 0.35,
        cellBorderTolerance: 0.08,
    }
};

function ScratchCardsBalanceChange(balance) {
    // Add here the code to update the balance on screen
}

//======================================
var gameSettings;
var gameState;



var ScratchCard = function($elScratchCard) {
    console.log("TYPE:", $elScratchCard[0].attributes['game-type'].value);
    var _game_type = $elScratchCard[0].attributes['game-type'].value;
//    gameInstance = this;

    var _this = this;
    
    // populate settings and state...
    this.makeGetRequest(ScratchCards.config.actionURL + 'scratchCardsGetGameSettings?gameType=' + _game_type, this, function(data, _this) {

//console.log("THIS:", this);
        //_this.started = true;
        //_this.gameState = data;

        // Reset all cells (in case we're starting a new, second, game)
        //$.each(_this.cells, function(){
        //    this.reset();
        //});

        //_this.processGameState();
        //ScratchCardsBalanceChange(ScratchCards.balance);
        gameSettings = data;
        console.log("GAME SETTING:", data);



        //var gameSettings = $elScratchCard.data("game-settings");
        //var gameState = $elScratchCard.data("game-state");

        ///
        // need to get gameState first!
        //

        _this.makeGetRequest(ScratchCards.config.actionURL + 'scratchCardsGetGameState?gameType=' + _game_type + '&wallet=' + App.userWalletAddress, _this, function(data, _this) {

            //console.log("GAME STATE:", data);
            gameState = data;
            
            _this.gameSettings = gameSettings;
            _this.gameState = gameState;
            _this.gameType = gameSettings.id;
            _this.gameId = null;
            _this.started = false;
            if(gameState.ended==0 && gameState.game_id > 0)
                _this.started = true;

            _this.cells = [];
            _this.numCellsToOpen = parseInt(gameSettings.cells_to_open, 10);
            _this.elScratchCard = $elScratchCard[0];

            _this.$elDialogs = $elScratchCard.find(".scratch_card_dialog");
            _this.elDialogOverlay = $elScratchCard.find(".scratch_card_dialog_overlay")[0];
            _this.elStartGameDialog = $elScratchCard.find(".scratch_card_start_game_dialog")[0];
            _this.elEndGameNoPrizeDialog = $elScratchCard.find(".scratch_card_end_game_no_prize_dialog")[0];
            _this.elEndGameWithPrizeDialog = $elScratchCard.find(".scratch_card_end_game_with_prize_dialog")[0];
            _this.elNoBalanceDialog = $elScratchCard.find(".scratch_card_no_balance_dialog")[0];
            _this.elErrorLoggedOutDialog = $elScratchCard.find(".scratch_card_logged_out_dialog")[0];
            _this.elErrorLoggedOutDialog2 = $elScratchCard.find(".scratch_card_logged_out_dialog2")[0];
            _this.elErrorServerErrorDialog = $elScratchCard.find(".scratch_card_server_error_dialog")[0];
            _this.elErrorFailedRequestDialog = $elScratchCard.find(".scratch_card_failed_request_dialog")[0];


            if(gameSettings.total_cells == gameSettings.cells_to_open) {
                $('#whichCellsDisplayMsg').html('all');
            } else {
                $('#whichCellsDisplayMsg').html(gameSettings.cells_to_open);
            }

            // We use this counter to see how far we've scratched, to make the start of scratches
            //   thinner. We need to keep this at the scratchCard level, not at the Cell level,
            //   since you'll be moving between cells a lot
            // Because of that, we'll also need to track mousemove and leave in the scratchcard itself, to reset this
            _this.scratching = false;
            _this.scratchSteps = 0;

            // Initialize cells based on the DOM elements we found
            var cellNum = 0;
            $elScratchCard.find(".scratch_card_cell").each(function(){
                _this.cells.push(new ScratchCardCell(_this, cellNum, $(this)));
                cellNum++;
            });

        	// Listen to mouse and touch events
            $elScratchCard.mousemove(function(e){ _this.mousemove(e); });
            $elScratchCard.mouseleave(function(e){ _this.mouseleave(e); });
            $elScratchCard.mouseup(function(e){ _this.mouseup(e); });
        	_this.elScratchCard.addEventListener("touchmove", _this.touchmove.bind(_this), false);
        	_this.elScratchCard.addEventListener("touchend", _this.touchend.bind(_this), false);
        	_this.elScratchCard.addEventListener("touchcancel", _this.touchcancel.bind(_this), false);

            // Any dialog button hides dialogs and the overlay
            $elScratchCard.find(".scratch_card_dialog_button").click(function(){
                _this.$elDialogs.hide();
                $(_this.elDialogOverlay).hide();
            });

            // Handle the dialog buttons
            $elScratchCard.find(".scratch_card_dialog_button_play_now").click(function(){ _this.start(); });
            $elScratchCard.find(".scratch_card_dialog_button_play_again").click(function(){ _this.start(); });
            $elScratchCard.find(".scratch_card_dialog_button_refresh").click(function(){ window.location.reload(); });

            $elScratchCard.find(".scratch_card_dialog_button_collect_prize").click(function(){ window.location.href = $(_this).data("url"); });


            if (_this.started) {
                _this.processGameState();
            } else {
                _this.showStartGameDialog();
            }

        });

    });

}

ScratchCard.prototype.processGameState = function() {
    var _this = this;
    //console.log("_THIS:",_this);

    var gameState = this.gameState;
    //console.log("GAMESTATE:", gameState);
    this.gameId = gameState.game_id;
    //console.log("this.gameId", this.gameId, gameState.assigned_cells);



    if(gameState.assigned_cells)
        gameState.assigned_cells = (gameState.assigned_cells + "").split(",");

    $.each(this.cells, function(i, cell){
        var cellAssignedIcon = (gameState.assigned_cells ? gameState.assigned_cells[i] : null);
        if (cellAssignedIcon) {
            //console.log("ASSIGNED ICONS:", i, cellAssignedIcon);
            cell.assignIcon(cellAssignedIcon);
        }
    });

    // Mark as open the cells that the server told us are opened already.
    if (gameState.opened_cells) {
        gameState.opened_cells = (gameState.opened_cells + "").split(",");

        console.log("HAVE OPEN CELLS!", gameState.opened_cells);
        $.each(gameState.opened_cells, function(){
            //console.log("CELL:", this);
            var cellNum = this;
            _this.cells[cellNum].markOpened();
        });
    }

    if (this.started && gameState.ended && this.completedCells().length >= this.numCellsToOpen && !this.scratching) {
        _this.handleEndGame();
    }
};

ScratchCard.prototype.showDialog = function(elDialog) {
    $(elDialog).show();
    $(this.elDialogOverlay).show();
};

ScratchCard.prototype.showStartGameDialog = function() {

    this.showDialog(this.elStartGameDialog);
};

ScratchCard.prototype.showEndGameNoPrizeDialog = function() {
    this.showDialog(this.elEndGameNoPrizeDialog);
};

ScratchCard.prototype.showEndGameWithPrizeDialog = function(dialogBody, collectPrizeURL) {
    var $dialog = $(this.elEndGameWithPrizeDialog);
    $dialog.find(".scratch_card_dialog_body").html(dialogBody);

    // show the correct button
    $dialog.find(".scratch_card_dialog_button").hide();

    if (collectPrizeURL) {
        var $button = $dialog.find(".scratch_card_dialog_button_collect_prize");
        $button.data("url", collectPrizeURL);
        $button.show();
    } else {
        $dialog.find(".scratch_card_dialog_button_play_again").show();
    }

    this.showDialog($dialog);
};

ScratchCard.prototype.checkBalance = function(bet) {
    // call method from main js script...

    if (ScratchCards.balance < bet) {
        this.showDialog(this.elNoBalanceDialog);
        return false;
    } else {
        return true;
    }
};



ScratchCard.prototype.start = function(bet) {
    var _this = this;

    if(!sessionLoggedOn) {
       // doSessionLogin(this.start);
        this.showDialog(this.elErrorLoggedOutDialog2);
        return false;
    }



    if (!bet) { bet = this.gameSettings.cost; }
    if (!this.checkBalance(bet)) { return false; } // Make sure user has enough balance to start the game

    var params = { action: "start", game_type: this.gameType, bet: bet, wallet: App.userWalletAddress, session: getSessionSignature() };
    this.makeRequest(ScratchCards.config.actionURL + 'scratchCardsStart', params, function(data) {
        _this.started = true;
        _this.gameState = data;
        //console.log("NEW GAME STATE:", _this.gameState, data);

        // Reset all cells (in case we're starting a new, second, game)
        $.each(_this.cells, function(){
            console.log("RESETING:", this);
            this.reset();
            console.log("AFTER:", this);
        });

        _this.processGameState();

        //ScratchCardsBalanceChange(ScratchCards.balance);

    });
};

ScratchCard.prototype.openCell = function(cellNum) {
    var _this = this;

    var params = {
        action: "open",
        game_type: this.gameType,
        game_id: this.gameId,
        client_open_cells: this.openedCells().length,
        cell_num: cellNum,
        wallet: App.userWalletAddress,
        session: getSessionSignature()
    };

    this.makeRequest(ScratchCards.config.actionURL + 'scratchCardsOpen', params, function(data) {
        console.log("OPEN DATA:", data);
        _this.gameState = data;
        _this.processGameState();
    });
};

ScratchCard.prototype.handleEndGame = function() {
    console.log("PRIZE:", this.gameState);
    var prize = this.gameState.prize;
    var payout = parseFloat(this.gameState.pay_out, 10);

    if (!prize) {
        this.showEndGameNoPrizeDialog();
    } else {
        var dialogBody = this.generatePrizeText(prize, payout);
        this.showEndGameWithPrizeDialog(dialogBody, prize.win_redirect_url);
        ScratchcardSounds.playSound('win');
    }

    ScratchCardsBalanceChange(ScratchCards.balance);
    this.started = false;
};

ScratchCard.prototype.generatePrizeText = function(prize, payout) {
    if (prize.prize_name) {
        return "You won " + prize.prize_name;
    } else {
        return "You have just won " + displayFromSUN(payout,2) + " TRX!";
    }
};
// pay in: 50000000
// pay out: 5000000000
//5000000000
//5000000000
//500000000.000000
ScratchCard.prototype.formatPayout = function(payout) {
    if (payout == 1) {
        return payout + " " + ScratchCards.config.balanceNameSingular; // 1 credit / 1 coin / 1 dollar
    } else {
        return payout + " " + ScratchCards.config.balanceNamePlural; // 2 credits / 5 coins / 0.25 dollars
    }
};

ScratchCard.prototype.makeRequest = function(url, params, fnSuccess) {
    var _this = this;

    $.ajax({
        url: url,
        type: "POST",
        data: params,
        dataType: "json",
        timeout: 10000,
        success: function(data){
            if (!data.success) {
                return _this.handleServerError(data);
            }

            ScratchCards.balance = data.balance;
            //fnSuccess(data.game_state);
            //console.log("REQUEST DATA:", data);
            fnSuccess(data);
        },
        error: function() {
            return _this.handleServerError({});
        }
    });
};


ScratchCard.prototype.makeGetRequest = function(url, _this, fnSuccess) {
    //var _this = this;
    console.log("makeGetRequest", url);
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        timeout: 10000,
        success: function(data){
            console.log("GET:", data);
            if (!data.success) {
                return _this.handleServerError(data);
            }

//            ScratchCards.balance = data.balance;
            fnSuccess(data, _this);
        },
        error: function(err) {
            return _this.handleServerError(err);
        }
    });
};

ScratchCard.prototype.handleServerError = function(data) {
    console.error("ERROR:", data);
    if (data.error) {
        if (data.error == "loggedOut") {
            this.showDialog(this.elErrorLoggedOutDialog);
        } else {
            var $dialog = $(this.elErrorServerErrorDialog);
            $dialog.find(".scratch_card_dialog_body").html(data.error);
            this.showDialog($dialog);
        }
    } else {

        this.showDialog(this.elErrorFailedRequestDialog);
    }

    return false;
};



ScratchCard.prototype.mousemove = function(e) {
    var buttons = buttonPressedFromEvent(e);
    if (buttons != 1) { // buttons == 1 means left button pressed
        this.endScratch();
    }
};

ScratchCard.prototype.mouseleave = function(e) {
    this.endScratch();
};

ScratchCard.prototype.mouseup = function(e) {
    this.endScratch();
};

ScratchCard.prototype.touchend = function(e) {
    this.endScratch();
};

ScratchCard.prototype.touchcancel = function(e) {
    this.endScratch();
};

// Touch events work very different from mouse events. Once a touch starts on
//   a certain element, then THAT element gets touch events FOREVER until the touch
//   ends, even if the touch leaves that element.
//
// We're listening to touch events on the scratchcards because of this. Once a touch
//   starts on a cell, that cell is the "target" of the touch. When the touch moves elsewhere
//   the original cell is still the target.
//
// We also don't get the coordinates of the touch relative to the element that's listening,
//   we get viewport, screen and page coordinates.
//
// So, we need to just manually work out the coordinates. Every cell knows what its rect is,
//   with respect to the scratchcard. So we take the page coordinates of the touch AND the scratchard
//   to find where the touch is in the scratchcard, and then then go cell by cell, checking if
//   that point is within their rect, in which case we "emulate" a mouse event. We also send
//   "mouseleave" to all other cells, whether the touch had been on them or not, since all it does
//   is mark the cell as not being scratched, which is excessive, but correct.
ScratchCard.prototype.touchmove = function(e) {
	var _this = this;
	var touch = e.touches[0];
	if (!touch) { return; }

	// we're scratching, stop the scrolling
	if (this.scratching) {
		e.preventDefault();
	}

	var scratchPos = $(this.elScratchCard).offset();
	var p = { x: touch.pageX - scratchPos.left, y: touch.pageY - scratchPos.top }; // touch coordinates with respect to the scratchcard

	$.each(this.cells, function(i, cell){
		if (_this.pointWithinCell(p, cell)) {
			var e = { offsetX: p.x - cell.rect.left, offsetY: p.y - cell.rect.top, buttons: 1, preventDefault: function(){} };
			cell.mousemove(e);
			e.preventDefault(); // for good measure
		} else {
			cell.mouseleave();
		}
	});
};

ScratchCard.prototype.pointWithinCell = function(p, cell) {
	var rect = cell.rect;
	return (p.x > rect.left && p.x < rect.right &&
			p.y > rect.top  && p.y < rect.bottom);
};

// Flags that we're scratching. It's the opposite of `endScratch`, but doesn't do any scratching
ScratchCard.prototype.startScratch = function() {
    this.scratching = true;
    $(this.elScratchCard).addClass("scratching");
};

ScratchCard.prototype.endScratch = function() {
    this.scratchSteps = 0;
    this.scratching = false;
    $(this.elScratchCard).removeClass("scratching");

    this.processGameState();
};

ScratchCard.prototype.openedCells = function() {
    var openedCells = [];
    $.each(this.cells, function(){
        if (this.opened) { openedCells.push(this); }
    });
    return openedCells;
};

ScratchCard.prototype.completedCells = function() {
    var completedCells = [];
    $.each(this.cells, function(){
        if (this.complete) { completedCells.push(this); }
    });
    return completedCells;
};

ScratchCard.prototype.cellCompleted = function(cellNum) {
    this.processGameState();
};

//======================================

var ScratchCardCell = function(scratchCard, i, $elCell) {
    var _this = this;

    this.cellNum = i;
    this.scratchCard = scratchCard;
    this.elCell = $elCell[0];
    this.elIcon = $elCell.find(".scratch_card_cell_icon")[0];
    this.cnvScratch = $elCell.find(".cnv_scratch")[0];
    console.log("this.cnvScratch", this.cnvScratch);
	this.rect = this.findCellRectInScratchCard();

    $(this.cnvScratch).mousemove(function(e){ _this.mousemove(e); })
        .mouseleave(function(e){ _this.mouseleave(e); });

    this.reset();
};

ScratchCardCell.prototype.reset = function() {
    $(this.elCell).removeClass().addClass("scratch_card_cell");
    $(this.elIcon).removeClass().addClass("scratch_card_cell_icon");

    this.lastPoint = null; // if this isn't null, we're currently scratching this canvas. If it's null, we're not.
    this.opened = false;
    this.complete = false; // it can't come from the server as "completed", you have to scratch again
    this.assignedIcon = null; // which Icon we should show behind the canvas
    this.canvasFinishedInit = false; // whether the canvas is ready and we can display the icon behind it

    this.initScratchCanvas();
};

ScratchCardCell.prototype.initScratchCanvas = function() {
    var _this = this;

    this.cnvScratch.width = this.elCell.clientWidth;
    this.cnvScratch.height = this.elCell.clientHeight;
    this.cnvScratchContext = this.cnvScratch.getContext("2d");

    var $bgDiv = $(this.scratchCard.elScratchCard).find(".scratch_card_scratch_area_image");
    var bgURL = $bgDiv.css('background-image');
    bgURL = bgURL.replace('url(','').replace(')','').replace('"','').replace('"',''); // http://stackoverflow.com/questions/27837440/draw-divs-background-image-on-canvas
    var img = new Image();
    //console.log("SIZE:", $bgDiv.width(), $bgDiv.height(), 0, 0, _this.cnvScratch.width, _this.cnvScratch.height);
    // 128 128 0 0 108 108
    img.onload = function(){
        _this.cnvScratchContext.drawImage(img, 0, 0, $bgDiv.width(), $bgDiv.height(), 0, 0, _this.cnvScratch.width, _this.cnvScratch.height);

        _this.canvasFinishedInit = true;
        _this.showAssignedIcon();
    };
    img.src = bgURL;
};

ScratchCardCell.prototype.mousemove = function(e) {
    var coords = { x: e.offsetX, y: e.offsetY };
    var buttons = buttonPressedFromEvent(e);

    if (!this.scratchCard.started) {
        return; // don't allow scratching if the game isn't started
    }

    if (buttons != 1) { // buttons == 1 means left button pressed
        this.lastPoint = null;
        return;
    }

    // Do not allow to scratch this cell if we already have enough open cells
    if (!this.opened && this.scratchCard.openedCells().length >= this.scratchCard.numCellsToOpen) {
        this.markDenied();
        return;
    }

    // look if we're inside the cell, excluding border tolerance, and mark as opened
    if (this.pointWithinUsefulRect(coords)) {
        this.open();
    }

    if (this.lastPoint) {
        this.scratchLine(this.lastPoint, coords);
    }

    // If this gets slow, do it on mouseleave/touchleave/touchend,
    //   or change the step in the loop to 8, 12 or 16 to sample fewer points
    if (this.percentageScratched() > ScratchCards.config.cellCompletePercentage) {

        this.markComplete();
    }

    this.lastPoint = coords;
    this.scratchCard.startScratch(); // flag that we're scratching
};

ScratchCardCell.prototype.mouseleave = function(e) {
    this.lastPoint = null;
};

ScratchCardCell.prototype.findCellRectInScratchCard = function() {
	var cellOffset = $(this.cnvScratch).offset();
   
	var scratchOffset = $(this.scratchCard.elScratchCard).offset();
	var left = cellOffset.left - scratchOffset.left,
		top = cellOffset.top - scratchOffset.top,
		width = $(this.cnvScratch).width(),
		height = $(this.cnvScratch).height();

	return { left: left, top: top,  right: left + width,  bottom: top + height };
};

ScratchCardCell.prototype.pointWithinUsefulRect = function(p) {
    var borderTolerance = ScratchCards.config.cellBorderTolerance;

    var usefulRect = { left: this.cnvScratch.width * borderTolerance,
        right: (this.cnvScratch.width * (1- borderTolerance)),
        top: this.cnvScratch.height * borderTolerance,
        bottom: (this.cnvScratch.height * (1- borderTolerance))}

    return (p.x > usefulRect.left && p.x < usefulRect.right &&
    p.y > usefulRect.top  && p.y < usefulRect.bottom);
};

ScratchCardCell.prototype.assignIcon = function(icon) {
    this.assignedIcon = icon;
    this.showAssignedIcon();
};

ScratchCardCell.prototype.showAssignedIcon = function() {
    // Do not show the icon before the canvas is loaded, otherwise, we get a peek of what's behind,
    //   since the drawing of the canvas depends on asynchronously loading an Image, and
    //   drawing the canvas "onLoad" of that image
    if (this.assignedIcon && this.canvasFinishedInit) {
        //console.log("ASSIGNING ICON:", this.elIcon, this.assignedIcon);
        $(this.elIcon).addClass("icon_" + this.assignedIcon.replace(" ", ""));
    }
};

ScratchCardCell.prototype.open = function(e) {
    if (this.opened) { return; }
    this.scratchCard.openCell(this.cellNum);
    this.markOpened();
};

ScratchCardCell.prototype.markOpened = function(e) {
    this.opened = true;
    $(this.elCell).addClass("opened");
};

ScratchCardCell.prototype.markComplete = function(e) {
    

    if (this.complete) { return; }
    this.complete = true;
    $(this.elCell).addClass("complete");
    this.scratchCard.cellCompleted(this.cellNum);
    ScratchcardSounds.playSound('cell_ready');
};

ScratchCardCell.prototype.markDenied = function(e) {
    $(this.elCell).addClass("denied");
};

ScratchCardCell.prototype.scratchLine = function(from, to) {
    var ctx = this.cnvScratchContext;
    var dX = to.x - from.x;
    var dY = to.y - from.y;
    var distance = Math.sqrt(dX * dX + dY * dY);
    var steps = Math.ceil(distance);

    for (var i = 0; i < steps; i++) {
        this.scratchCard.scratchSteps += 1;
        var t = i / steps;
        var p = { x: from.x + dX * t, y: from.y + dY * t };
        var width = ScratchCards.config.scratchLineWidth;
        if (this.scratchCard.scratchSteps < 100) { width = width * (this.scratchCard.scratchSteps / 100); }  // If the scratch just started, size up slowly.
        if (this.scratchCard.scratchSteps > 1000) { this.scratchCard.scratchSteps = 0; }  // Every now and then, reset scratch width, to leave gaps like you get with coins
        this.scratchRect(ctx, p, width);
    }

    ScratchcardSounds.playScratchSound();
};

// Clear a rectangle, with a smoothed gradient from opaque in the middle to almost not touching it in the outside.
// This replaces a call to `clearRect()`, to make it look less blocky
ScratchCardCell.prototype.scratchRect = function(ctx, p, width) {
    // Because of the math we're doing to move stuff around, we end up with floats here.
    // That's fine in most browsers, but in Edge, getImageData / putImageData do weird stuff with those floats. So, make sure we're using integers from now on.
    p = { x: Math.floor(p.x), y: Math.floor(p.y) };
    width = Math.floor(width);

    if (width < 2) { return; }

    var halfWidth = Math.floor(width / 2);
    var pixelSection = ctx.getImageData(p.x - halfWidth, p.y - halfWidth, width, width);
    var pixels = pixelSection.data;

    // Scratch harder in the middle, and less opaque around, to make it less "square moving around"
    var i = 3;
    for (var y = 0; y < width; y++) {
        for (var x = 0; x < width; x++) {
            // Performance: If this gets slow, then take the max of X and Y, and look up on a table what the opacity should be.
            // That table changes with the stroke width, so we'll need one for each width, from 1 to ScratchCards.config.scratchLineWidth.
            // Don't hard-code it in code, though, pre-calculate it on Init
            var centerDist = Math.abs(halfWidth - (Math.max(x, y)));
            var opacity = Math.floor(255 * (centerDist / halfWidth));
            pixels[i] = Math.min(pixels[i], opacity);

            i += 4;
        }
    }

    ctx.putImageData(pixelSection, p.x - halfWidth, p.y - halfWidth);
};

ScratchCardCell.prototype.percentageScratched = function() {
    var pixels = this.cnvScratchContext.getImageData(0, 0, this.cnvScratch.width, this.cnvScratch.height).data;
    var l = pixels.length;
    var numPixels = l / 4, numGone = 0;
    for (var i=0; i < l; i += 4) {
        var alpha = pixels[i+3];
        if (alpha < 90) { numGone++; }
    }
    return (numGone / numPixels);
};

//======================================

var ScratchcardSounds = {
    sounds: {},

    init: function() {
        soundManager.setup({
            url: "js/",
            debugMode: false,
            onready: function() {
                ScratchcardSounds.sounds['scratch'] = soundManager.createSound({
                    id: "scratch",
                    url: 'sounds/scratch_long.mp3',
                    loops: 9999,
                    autoLoad: true
                });
                ScratchcardSounds.sounds['cell_ready'] = soundManager.createSound({
                    id: "cell_ready",
                    url: 'sounds/cell_ready.mp3',
                    autoLoad: true
                });
                ScratchcardSounds.sounds['win'] = soundManager.createSound({
                    id: "win",
                    url: 'sounds/win.mp3',
                    autoLoad: true
                });
            }
        });
    },

    playSound: function(sound_id) {
        ScratchcardSounds.sounds[sound_id].play();
    },

    // Scratching sound starts when you scratch, gets paused a bit after (but not if you continue scratching), and reset
    //   to the start a bit more after.
    //
    // Every "time" a scratch is made, the scratchcards call "playScratchSound", which managers all its timers
    pauseScratchTimer: null,
    stopScratchTimer: null,
    scratchSoundPlaying: false,

    playScratchSound: function() {
        if (!ScratchcardSounds.scratchSoundPlaying) {
            ScratchcardSounds.sounds['scratch'].play();
            ScratchcardSounds.scratchSoundPlaying = true;
        }

        window.clearTimeout(ScratchcardSounds.pauseScratchTimer);
        window.clearTimeout(ScratchcardSounds.stopScratchTimer);

        ScratchcardSounds.pauseScratchTimer = window.setTimeout(ScratchcardSounds.pauseScratchSound, 100);
        ScratchcardSounds.stopScratchTimer = window.setTimeout(ScratchcardSounds.stopScratchSound, 1000);
    },

    pauseScratchSound: function() {
        ScratchcardSounds.sounds['scratch'].pause();
        ScratchcardSounds.scratchSoundPlaying = false;
    },

    stopScratchSound: function() {
        ScratchcardSounds.sounds['scratch'].stop();
        ScratchcardSounds.scratchSoundPlaying = false;
    }
};

//======================================

function buttonPressedFromEvent(e) {
    // e.buttons is undefined only in Safari, and which has the information we want. For everyone else, it works.
    return (e.buttons === undefined ? e.which : e.buttons);
}

//======================================



//$(window).on("load", function() {
function _startScratchCards() {
    ScratchcardSounds.init();
    $('#gameLoadingDiv').hide();
    $(".scratch_card").each(function(){

        

        scratchCard = new ScratchCard($(this));
    });
}


