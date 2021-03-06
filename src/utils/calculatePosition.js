import getOffset from 'dom-helpers/query/offset';
import getPosition from 'dom-helpers/query/position';
import getScrollTop from 'dom-helpers/query/scrollTop';

import ownerDocument from './ownerDocument';

function getContainerDimensions(containerNode) {
  let width, height, scroll;

  if (containerNode.tagName === 'BODY') {
    width = window.innerWidth;
    height = window.innerHeight;

    scroll =
      getScrollTop(ownerDocument(containerNode).documentElement) ||
      getScrollTop(containerNode);
  } else {
    ({ width, height } = getOffset(containerNode));
    scroll = getScrollTop(containerNode);
  }

  return { width, height, scroll};
}

function getTopDelta(top, overlayHeight, container, padding) {
  const containerDimensions = getContainerDimensions(container);
  const containerScroll = containerDimensions.scroll;
  const containerHeight = containerDimensions.height;

  const topEdgeOffset = top - padding - containerScroll;
  const bottomEdgeOffset = top + padding - containerScroll + overlayHeight;

  if (topEdgeOffset < 0) {
    return -topEdgeOffset;
  } else if (bottomEdgeOffset > containerHeight) {
    return containerHeight - bottomEdgeOffset;
  } else {
    return 0;
  }
}

function getLeftDelta(left, overlayWidth, container, padding) {
  const containerDimensions = getContainerDimensions(container);
  const containerWidth = containerDimensions.width;

  const leftEdgeOffset = left - padding;
  const rightEdgeOffset = left + padding + overlayWidth;

  if (leftEdgeOffset < 0) {
    return -leftEdgeOffset;
  } else if (rightEdgeOffset > containerWidth) {
    return containerWidth - rightEdgeOffset;
  }

  return 0;
}

export default function calculatePosition(
  placement, verticalPosition, overlayNode, target, container, padding
) {
  let childOffset = container.tagName === 'BODY' ? getOffset(target) : getPosition(target, container);

  const { height: overlayHeight, width: overlayWidth } = getOffset(overlayNode);

  // Overflowing content
  if (target.scrollWidth > target.offsetWidth) {
      childOffset.width = target.offsetWidth
  }
  else if (target.parentElement.scrollWidth > target.parentElement.offsetWidth) {
      childOffset.width = target.parentElement.offsetWidth;
  }

  let positionLeft, positionTop, positionBottom, arrowOffsetLeft, arrowOffsetTop;

  if (placement === 'left' || placement === 'right') {
    positionTop = childOffset.top + (childOffset.height - overlayHeight) / 2;

    if (placement === 'left') {
      positionLeft = childOffset.left - overlayWidth;
    } else {
      positionLeft = childOffset.left + childOffset.width;
    }

    const topDelta = getTopDelta(
      positionTop, overlayHeight, container, padding
    );

    positionTop += topDelta;
    arrowOffsetTop = 50 * (1 - 2 * topDelta / overlayHeight) + '%';
    arrowOffsetLeft = void 0;

  } else if (placement === 'top' || placement === 'bottom') {
    positionLeft = childOffset.left + (childOffset.width - overlayWidth) / 2;

    if (verticalPosition === 'top') {
        if (placement === 'top') {
            positionTop = childOffset.top - overlayHeight;
        } else {
            positionTop = childOffset.top + childOffset.height;
        }
    }
    else if (verticalPosition === 'bottom') {
        if (placement === 'top') {
            positionBottom = container.clientHeight - childOffset.top;
        } else {
            positionBottom = container.clientHeight - (overlayHeight + childOffset.top + childOffset.height)
        }
    } else {
        throw new Error(
            `calcOverlayPosition(): No such verticalPosition of "${verticalPosition}" found.`
        );
    }

    const leftDelta = getLeftDelta(
      positionLeft, overlayWidth, container, padding
    );

    positionLeft += leftDelta;
    arrowOffsetLeft = 50 * (1 - 2 * leftDelta / overlayWidth) + '%';
    arrowOffsetTop = void 0;

  } else {
    throw new Error(
      `calcOverlayPosition(): No such placement of "${placement}" found.`
    );
  }

  return { positionLeft, positionTop, positionBottom, arrowOffsetLeft, arrowOffsetTop };
}
