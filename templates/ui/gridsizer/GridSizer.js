import ContainerLite from 'rexPlugins/gameobjects/containerlite/ContainerLite.js';
import ParsePaddingConfig from '../utils/ParsePaddingConfig.js';
import GetSizerConfig from '../sizer/GetSizerConfig.js';
import GetChildrenWidth from './GetChildrenWidth.js';
import GetChildrenHeight from './GetChildrenHeight.js';
import GetAllChildrenSizer from './GetAllChildrenSizer.js';
import PushIntoBounds from '../utils/PushIntoBounds.js';
import Layout from './Layout.js';
import DrawBounds from '../utils/DrawBounds.js';
import ALIGNMODE from '../utils/AlignConst.js';

const Container = ContainerLite;
const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
const GetValue = Phaser.Utils.Objects.GetValue;
const RemoveItem = Phaser.Utils.Array.Remove;
const ALIGN_CENTER = Phaser.Display.Align.CENTER;

class GridSizer extends Container {
    constructor(scene, x, y, minWidth, minHeight, columnCount, rowCount) {
        var config;
        if (IsPlainObject(x)) {
            config = x;
            x = GetValue(config, 'x', 0);
            y = GetValue(config, 'y', 0);
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
            columnCount = GetValue(config, 'column', 0);
            rowCount = GetValue(config, 'row', 0);
        } else if (IsPlainObject(minWidth)) {
            config = minWidth;
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
            columnCount = GetValue(config, 'column', 0);
            rowCount = GetValue(config, 'row', 0);
        } else if (IsPlainObject(columnCount)) {
            config = columnCount;
            columnCount = GetValue(config, 'column', 0);
            rowCount = GetValue(config, 'row', 0);
        }
        super(scene, x, y, 2, 2);
        this.type = 'rexGridSizer';
        this.isRexSizer = true;
        this.setName(GetValue(config, 'name', ''));

        this.initialGrid(columnCount, rowCount);
        this.setMinWidth(minWidth);
        this.setMinHeight(minHeight);
    }

    destroy(fromScene) {
        //  This Game Object has already been destroyed
        if (!this.scene) {
            return;
        }
        this.gridChildren.length = 0;
        this.backgroundChildren.length = 0;
        super.destroy(fromScene);
    }

    setColumnProportion(columnIndex, proportion) {
        if (columnIndex >= this.columnProportions.length) {
            return this;
        }
        this.columnProportions[columnIndex] = proportion;
        return this;
    }

    setRowProportion(rowIndex, proportion) {
        if (rowIndex >= this.rowProportions.length) {
            return this;
        }
        this.rowProportions[rowIndex] = proportion;
        return this;
    }

    add(gameObject, columnIndex, rowIndex, align, paddingConfig, expand) {
        super.add(gameObject);
        if (IsPlainObject(columnIndex)) {
            var config = columnIndex;
            columnIndex = GetValue(config, 'column', 0);
            rowIndex = GetValue(config, 'row', 0);
            align = GetValue(config, 'align', ALIGN_CENTER);
            paddingConfig = GetValue(config, 'padding', 0);
            expand = GetValue(config, 'expand', false);
        }
        if (typeof (align) === 'string') {
            align = ALIGNMODE[align];
        }
        if (align === undefined) {
            align = ALIGN_CENTER;
        }
        if (paddingConfig === undefined) {
            paddingConfig = 0;
        }
        if (expand === undefined) {
            expand = false;
        }

        var config = this.getSizerConfig(gameObject);
        // config.proportion = 0;
        config.align = align;
        config.padding = ParsePaddingConfig(paddingConfig);
        config.expand = expand;
        this.gridChildren[(rowIndex * this.columnCount) + columnIndex] = gameObject;
        return this;
    }

    addBackground(gameObject, paddingConfig) {
        super.add(gameObject);
        if (paddingConfig === undefined) {
            paddingConfig = 0;
        }

        var config = this.getSizerConfig(gameObject);
        // config.proportion = 0;
        config.align = ALIGN_CENTER;
        config.padding = ParsePaddingConfig(paddingConfig);
        config.expand = true;
        this.backgroundChildren.push(gameObject);
        return this;
        f
    }

    remove(gameObject) {
        RemoveItem(this.gridChildren, gameObject);
        RemoveItem(this.backgroundChildren, gameObject);
        super.remove(gameObject);
        return this;
    }

    setMinWidth(minWidth) {
        if (minWidth == null) {
            minWidth = 0;
        }
        this.minWidth = minWidth;
        return this;
    }

    setMinHeight(minHeight) {
        if (minHeight == null) {
            minHeight = 0;
        }
        this.minHeight = minHeight;
        return this;
    }

    get childrenWidth() {
        if (this._childrenWidth === undefined) {
            this._childrenWidth = this.getChildrenWidth();
        }
        return this._childrenWidth
    }

    get childrenHeight() {
        if (this._childrenHeight === undefined) {
            this._childrenHeight = this.getChildrenHeight();
        }
        return this._childrenHeight;
    }

    get totalColumnProportions() {
        var result = 0,
            proportion;
        for (var i = 0; i < this.columnCount; i++) {
            proportion = this.columnProportions[i];
            if (proportion > 0) {
                result += proportion;
            }
        }
        return result;
    }

    get totalRowProportions() {
        var result = 0,
            proportion;
        for (var i = 0; i < this.rowCount; i++) {
            proportion = this.rowProportions[i];
            if (proportion > 0) {
                result += proportion;
            }
        }
        return result;
    }

    initialGrid(columnCount, rowCount) {
        this.columnCount = columnCount;
        this.rowCount = rowCount;
        this.gridChildren = [];
        this.gridChildren.length = columnCount * rowCount;
        this.backgroundChildren = [];
        this.columnProportions = [];
        this.columnProportions.length = columnCount;
        this.columnWidth = [];
        this.columnWidth.length = columnCount;
        this.rowProportions = [];
        this.rowProportions.length = rowCount;
        this.rowHeight = [];
        this.rowHeight.length = rowCount;
        return this;
    }

    get left() {
        return this.x - (this.displayWidth * this.originX);
    }

    set left(value) {
        this.x += (value - this.left);
    }

    alignLeft(value) {
        this.left = value;
        return this;
    }

    get right() {
        return (this.x - (this.displayWidth * this.originX)) + this.displayWidth;
    }

    set right(value) {
        this.x += (value - this.right);
    }

    alignRight(value) {
        this.right = value;
        return this;
    }

    get top() {
        return this.y - (this.displayHeight * this.originY);
    }

    set top(value) {
        this.y += (value - this.top);
    }

    alignTop(value) {
        this.top = value;
        return this;
    }

    get bottom() {
        return (this.y - (this.displayHeight * this.originY)) + this.displayHeight;
    }

    set bottom(value) {
        this.y += (value - this.bottom);
    }

    alignBottom(value) {
        this.bottom = value;
        return this;
    }
}
var methods = {
    getSizerConfig: GetSizerConfig,
    getChildrenWidth: GetChildrenWidth,
    getChildrenHeight: GetChildrenHeight,
    getAllChildrenSizer: GetAllChildrenSizer,
    pushIntoBounds: PushIntoBounds,
    layout: Layout,
    drawBounds: DrawBounds,
}
Object.assign(
    GridSizer.prototype,
    methods
);

export default GridSizer;